import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import usePlayerStore from "../store/playerStore";

function formatTime(secs) {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Player() {
  const audioRef = useRef(null);
  const {
    currentTrack, isPlaying, volume, currentTime, duration,
    setAudioRef, togglePlay, seek, setVolume,
    setCurrentTime, setDuration, setIsPlaying,
  } = usePlayerStore();

  useEffect(() => {
    setAudioRef(audioRef.current);
  }, []);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-spotify-dark border-t border-spotify-hover px-4 py-3 z-50">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 w-64 shrink-0">
            <div className="w-12 h-12 bg-spotify-card rounded flex items-center justify-center overflow-hidden">
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
              <p className="text-xs text-spotify-muted">재생 중인 곡이 없습니다</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40"
            >
              {isPlaying ? (
                <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-black ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Seek bar */}
            <div className="flex items-center gap-2 w-full max-w-lg">
              <span className="text-xs text-spotify-muted w-8 text-right">{formatTime(currentTime)}</span>
              <div className="relative flex-1 h-1 group">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.5}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-1 cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1DB954 ${progress}%, #535353 ${progress}%)`,
                  }}
                />
              </div>
              <span className="text-xs text-spotify-muted w-8">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 w-32 shrink-0">
            <svg className="w-4 h-4 fill-spotify-muted shrink-0" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ffffff ${volume * 100}%, #535353 ${volume * 100}%)`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
