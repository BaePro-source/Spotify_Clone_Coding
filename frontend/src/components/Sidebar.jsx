import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getPlaylists, createPlaylist } from "../api/playlists";
import useAuthStore from "../store/authStore";
import useLangStore, { useT } from "../store/langStore";

const PLAYLIST_GRADIENTS = [
  "from-[#1DB954] to-[#0a3d1f]",
  "from-[#509bf5] to-[#1a3a6a]",
  "from-[#e97e00] to-[#6a3a00]",
  "from-[#e91429] to-[#6a0012]",
  "from-[#8c67ac] to-[#3a1a5c]",
];

function MusicNote({ className = "w-5 h-5" }) {
  return (
    <svg className={`fill-current ${className}`} viewBox="0 0 24 24">
      <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
    </svg>
  );
}

function NavLink({ to, children, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded font-semibold text-sm transition-colors ${
        isActive ? "text-white" : "text-spotify-muted hover:text-white"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

export default function Sidebar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [playlists, setPlaylists] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const { lang, setLang } = useLangStore();
  const t = useT();

  useEffect(() => {
    if (user) {
      getPlaylists().then((r) => setPlaylists(r.data)).catch(() => {});
    } else {
      setPlaylists([]);
    }
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const { data } = await createPlaylist({ name: newName.trim(), is_public: false });
    setPlaylists((prev) => [...prev, data]);
    setNewName("");
    setCreating(false);
    navigate(`/playlist/${data.id}`);
  };

  return (
    <aside className="flex flex-col w-64 h-full bg-black shrink-0 overflow-hidden">

      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <Link to="/" className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-spotify-green shrink-0">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          <span className="text-white font-bold text-xl">Spotify</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 flex flex-col gap-0.5 mb-4">
        <NavLink
          to="/"
          icon={
            <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3z" />
            </svg>
          }
        >
          {t.home}
        </NavLink>
        <NavLink
          to="/search"
          icon={
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="6" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          }
        >
          {t.search}
        </NavLink>
      </nav>

      {/* Library panel */}
      <div className="flex-1 flex flex-col min-h-0 mx-2 bg-spotify-dark rounded-lg overflow-hidden">

        {/* Library header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button className="flex items-center gap-3 text-spotify-muted hover:text-white font-bold text-sm transition-colors group">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
            </svg>
            <span>{t.myLibrary}</span>
          </button>
          {user && (
            <button
              onClick={() => setCreating(!creating)}
              title={t.addPlaylist}
              className="w-8 h-8 rounded-full flex items-center justify-center text-spotify-muted hover:text-white hover:bg-spotify-hover transition-colors text-xl leading-none"
            >
              +
            </button>
          )}
        </div>

        {/* Create playlist form */}
        {creating && (
          <form onSubmit={handleCreate} className="flex gap-1 mx-2 mb-2 px-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.enterName}
              className="flex-1 bg-spotify-card text-white text-sm px-3 py-1.5 rounded-md outline-none"
            />
            <button type="submit" className="text-spotify-green text-sm font-bold px-2">{t.add}</button>
          </form>
        )}

        {/* Library items */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {user ? (
            <div className="flex flex-col gap-0.5 mt-1">

              {/* 좋아요한 곡 - special entry */}
              <Link
                to="/liked"
                className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors group ${
                  location.pathname === "/liked" ? "bg-spotify-hover" : "hover:bg-spotify-hover"
                }`}
              >
                <div className="w-12 h-12 rounded bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.likedSongs}</p>
                  <p className="text-xs text-spotify-muted truncate">{t.playlist}</p>
                </div>
              </Link>

              {/* User playlists */}
              {playlists.map((pl, idx) => {
                const grad = PLAYLIST_GRADIENTS[idx % PLAYLIST_GRADIENTS.length];
                const isActive = location.pathname === `/playlist/${pl.id}`;
                return (
                  <Link
                    key={pl.id}
                    to={`/playlist/${pl.id}`}
                    className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors group ${
                      isActive ? "bg-spotify-hover" : "hover:bg-spotify-hover"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`}>
                      <MusicNote className="w-5 h-5 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-white"}`}>
                        {pl.name}
                      </p>
                      <p className="text-xs text-spotify-muted truncate">
                        {t.playlist} • {pl.track_count}곡
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mx-2 mt-2 p-4 bg-spotify-card rounded-lg">
              <p className="text-sm font-bold text-white mb-1">{t.addPlaylist}</p>
              <p className="text-xs text-spotify-muted leading-relaxed mb-4">{t.loginToCreate}</p>
              <Link
                to="/login"
                className="inline-block px-4 py-1.5 rounded-full border border-white text-white text-xs font-bold hover:scale-105 transition-transform"
              >
                {t.login}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Language switcher */}
      <div className="px-4 py-3">
        <button
          onClick={() => setLang(lang === "ko" ? "en" : "ko")}
          className="flex items-center gap-2 text-xs text-spotify-muted hover:text-white transition-colors px-2 py-1"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          {t.langLabel}
        </button>
      </div>
    </aside>
  );
}
