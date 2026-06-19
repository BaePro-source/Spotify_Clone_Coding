import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import usePlayerStore from "../store/playerStore";
import { useT } from "../store/langStore";

function formatTime(secs) {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Player() {
  const audioRef = useRef(null);
  const t = useT();
  const {
    currentTrack, isPlaying, volume, currentTime, duration,
    shuffle, repeat, showQueue,
    setAudioRef, togglePlay, seek, setVolume,
    setCurrentTime, setDuration, setIsPlaying,
    playNext, playPrev, toggleShuffle, toggleRepeat, toggleQueue,
  } = usePlayerStore();

  useEffect(() => {
    setAudioRef(audioRef.current);
  }, []);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onEnded={() => playNext()}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="h-24 bg-spotify-dark border-t border-spotify-hover px-4 shrink-0 flex items-center">
        <div className="w-full flex items-center gap-4">

          {/* Left: Track info */}
          <div className="flex items-center gap-3 w-64 shrink-0">
            <div className="w-14 h-14 bg-spotify-card rounded flex items-center justify-center overflow-hidden shrink-0">
              {currentTrack?.album?.cover_url ? (
                <img src={currentTrack.album.cover_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6 fill-spotify-muted" viewBox="0 0 24 24">
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                </svg>
              )}
            </div>
            {currentTrack ? (
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{currentTrack.title}</p>
                <p className="text-xs text-spotify-muted truncate">
                  <Link to={`/artist/${currentTrack.artist?.id}`} className="hover:underline">
                    {currentTrack.artist?.name}
                  </Link>
                </p>
              </div>
            ) : (
              <p className="text-xs text-spotify-muted">{t.noSongPlaying}</p>
            )}
          </div>

          {/* Center: Controls + Seekbar */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-center gap-5">
              <button onClick={toggleShuffle} title={t.shuffleTitle}
                className={`transition-transform hover:scale-110 ${shuffle ? "text-spotify-green" : "text-spotify-muted hover:text-white"}`}>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                </svg>
              </button>

              <button onClick={playPrev} disabled={!currentTrack} title={t.prevTitle}
                className="text-spotify-muted hover:text-white disabled:opacity-30 hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                </svg>
              </button>

              <button onClick={togglePlay} disabled={!currentTrack}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40">
                {isPlaying ? (
                  <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 fill-black ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button onClick={playNext} disabled={!currentTrack} title={t.nextTitle}
                className="text-spotify-muted hover:text-white disabled:opacity-30 hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
                </svg>
              </button>

              <button onClick={toggleRepeat} title={t.repeatTitle}
                className={`transition-transform hover:scale-110 ${repeat ? "text-spotify-green" : "text-spotify-muted hover:text-white"}`}>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full max-w-lg">
              <span className="text-xs text-spotify-muted w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
              <input type="range" min={0} max={duration || 0} step={0.5} value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="flex-1 h-1 cursor-pointer"
                style={{ background: `linear-gradient(to right, #1DB954 ${progress}%, #535353 ${progress}%)` }}
              />
              <span className="text-xs text-spotify-muted w-8 tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Queue toggle + Volume */}
          <div className="flex items-center gap-2 w-44 shrink-0">
            <button onClick={toggleQueue} title={t.queueTitle}
              className={`transition-colors shrink-0 ${showQueue ? "text-spotify-green" : "text-spotify-muted hover:text-white"}`}>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              </svg>
            </button>
            <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)} className="text-spotify-muted hover:text-white transition-colors">
              {volume === 0 ? (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              )}
            </button>
            <input type="range" min={0} max={1} step={0.01} value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 cursor-pointer"
              style={{ background: `linear-gradient(to right, #ffffff ${volume * 100}%, #535353 ${volume * 100}%)` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
