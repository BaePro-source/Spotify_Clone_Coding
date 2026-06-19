import { create } from "zustand";
import { getStreamUrl } from "../api/tracks";
import { addHistory } from "../api/history";

function playAudio(audioRef, track) {
  if (!audioRef) return;
  audioRef.src = getStreamUrl(track.id);
  audioRef.load();
  audioRef.play().catch(() => {});
  const token = localStorage.getItem("token");
  if (token) addHistory(track.id).catch(() => {});
}

const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  shuffle: false,
  repeat: false,

  audioRef: null,
  setAudioRef: (ref) => set({ audioRef: ref }),

  playTrack: (track, contextTracks = null) => {
    const { audioRef } = get();
    let newQueue = get().queue;
    let newIndex = -1;

    if (contextTracks && contextTracks.length > 0) {
      newQueue = contextTracks;
      newIndex = contextTracks.findIndex((t) => t.id === track.id);
      if (newIndex === -1) newIndex = 0;
    } else {
      newIndex = newQueue.findIndex((t) => t.id === track.id);
      if (newIndex === -1) {
        newQueue = [...newQueue, track];
        newIndex = newQueue.length - 1;
      }
    }

    set({ currentTrack: track, isPlaying: true, queue: newQueue, queueIndex: newIndex });
    playAudio(audioRef, track);
  },

  playNext: () => {
    const { queue, queueIndex, shuffle, repeat, audioRef, currentTrack } = get();

    if (repeat && currentTrack) {
      if (audioRef) { audioRef.currentTime = 0; audioRef.play().catch(() => {}); }
      return;
    }
    if (queue.length === 0) return;

    const nextIndex = shuffle
      ? Math.floor(Math.random() * queue.length)
      : (queueIndex + 1) % queue.length;

    const nextTrack = queue[nextIndex];
    set({ currentTrack: nextTrack, isPlaying: true, queueIndex: nextIndex });
    playAudio(audioRef, nextTrack);
  },

  playPrev: () => {
    const { queue, queueIndex, currentTime, audioRef } = get();

    if (currentTime > 3) {
      if (audioRef) audioRef.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;

    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIndex];
    set({ currentTrack: prevTrack, isPlaying: true, queueIndex: prevIndex });
    playAudio(audioRef, prevTrack);
  },

  togglePlay: () => {
    const { audioRef, isPlaying } = get();
    if (!audioRef) return;
    if (isPlaying) { audioRef.pause(); set({ isPlaying: false }); }
    else { audioRef.play().catch(() => {}); set({ isPlaying: true }); }
  },

  seek: (time) => {
    const { audioRef } = get();
    if (audioRef) { audioRef.currentTime = time; set({ currentTime: time }); }
  },

  setVolume: (vol) => {
    const { audioRef } = get();
    if (audioRef) audioRef.volume = vol;
    set({ volume: vol });
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  toggleRepeat: () => set((s) => ({ repeat: !s.repeat })),

  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setIsPlaying: (v) => set({ isPlaying: v }),

  showQueue: false,
  toggleQueue: () => set((s) => ({ showQueue: !s.showQueue })),

  jumpToQueue: (index) => {
    const { queue, audioRef } = get();
    if (index < 0 || index >= queue.length) return;
    const track = queue[index];
    set({ currentTrack: track, isPlaying: true, queueIndex: index });
    playAudio(audioRef, track);
  },
}));

export default usePlayerStore;
