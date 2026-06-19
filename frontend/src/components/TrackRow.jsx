import { useState } from "react";
import { Link } from "react-router-dom";
import { toggleLike } from "../api/likes";
import { addTrackToPlaylist, getPlaylists } from "../api/playlists";
import usePlayerStore from "../store/playerStore";
import useAuthStore from "../store/authStore";

function formatDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TrackRow({ track, index, liked: initialLiked = false, onLikeChange, contextTracks }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(initialLiked);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else {
      playTrack(track, contextTracks);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;
    const { data } = await toggleLike(track.id);
    setLiked(data.liked);
    if (onLikeChange) onLikeChange(track.id, data.liked);
  };

  const openPlaylistMenu = async (e) => {
    e.stopPropagation();
    if (!user) return;
    const { data } = await getPlaylists();
    setPlaylists(data);
    setShowPlaylistMenu(true);
  };

  const addToPlaylist = async (playlistId) => {
    await addTrackToPlaylist(playlistId, track.id);
    setShowPlaylistMenu(false);
  };

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-2 rounded hover:bg-spotify-hover cursor-pointer relative ${isActive ? "bg-spotify-hover" : ""}`}
      onClick={handlePlay}
    >
      {/* Index / play icon */}
      <div className="w-6 text-center text-spotify-muted text-sm shrink-0">
        {isActive && isPlaying ? (
          <svg className="w-4 h-4 fill-spotify-green mx-auto" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <span className={`group-hover:hidden ${isActive ? "hidden" : ""}`}>{index + 1}</span>
        )}
        <svg
          className={`w-4 h-4 fill-white mx-auto ${isActive && isPlaying ? "hidden" : "hidden group-hover:block"}`}
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      {/* Album cover */}
      <div className="w-10 h-10 bg-spotify-card rounded shrink-0 flex items-center justify-center overflow-hidden">
        {track.album?.cover_url ? (
          <img src={track.album.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-5 h-5 fill-spotify-muted" viewBox="0 0 24 24">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? "text-spotify-green" : "text-white"}`}>
          {track.title}
        </p>
        <p className="text-xs text-spotify-muted truncate">
          <Link
            to={`/artist/${track.artist?.id}`}
            className="hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {track.artist?.name}
          </Link>
          {" · "}
          <Link
            to={`/album/${track.album?.id}`}
            className="hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {track.album?.title}
          </Link>
        </p>
      </div>

      {/* Genre */}
      <span className="hidden md:block text-xs text-spotify-muted w-24 truncate">{track.genre}</span>

      {/* Like */}
      {user && (
        <button onClick={handleLike} className="opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className={`w-4 h-4 ${liked ? "fill-spotify-green" : "fill-spotify-muted hover:fill-white"}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      )}

      {/* Duration + playlist menu */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-spotify-muted w-10 text-right">{formatDuration(track.duration_seconds)}</span>
        {user && (
          <div className="relative">
            <button
              onClick={openPlaylistMenu}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-spotify-muted hover:text-white"
            >
              ···
            </button>
            {showPlaylistMenu && (
              <div className="absolute right-0 bottom-6 bg-spotify-card rounded shadow-lg z-50 min-w-40 py-1">
                <p className="px-4 py-1 text-xs text-spotify-muted">플레이리스트에 추가</p>
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => addToPlaylist(pl.id)}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-spotify-hover"
                  >
                    {pl.name}
                  </button>
                ))}
                <button
                  onClick={() => setShowPlaylistMenu(false)}
                  className="block w-full text-left px-4 py-2 text-xs text-spotify-muted hover:bg-spotify-hover"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
