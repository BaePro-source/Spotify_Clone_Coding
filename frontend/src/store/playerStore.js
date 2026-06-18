import { create } from "zustand";
import { getStreamUrl } from "../api/tracks";
import { addHistory } from "../api/history";

const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,

  audioRef: null,
  setAudioRef: (ref) => set({ audioRef: ref }),

  playTrack: (track) => {
    const { audioRef } = get();
    set({ currentTrack: track, isPlaying: true });
    if (audioRef) {
      audioRef.src = getStreamUrl(track.id);
      audioRef.load();
      audioRef.play().catch(() => {});
      // record history (fire-and-forget)
      const token = localStorage.getItem("token");
      if (token) addHistory(track.id).catch(() => {});
    }
  },

  togglePlay: () => {
    const { audioRef, isPlaying } = get();
    if (!audioRef) return;
    if (isPlaying) {
      audioRef.pause();
      set({ isPlaying: false });
    } else {
      audioRef.play().catch(() => {});
      set({ isPlaying: true });
    }
  },

  seek: (time) => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.currentTime = time;
      set({ currentTime: time });
    }
  },

  setVolume: (vol) => {
    const { audioRef } = get();
    if (audioRef) audioRef.volume = vol;
    set({ volume: vol });
  },

  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setIsPlaying: (v) => set({ isPlaying: v }),
}));

export default usePlayerStore;
