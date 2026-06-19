import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPlaylists, createPlaylist } from "../api/playlists";
import useAuthStore from "../store/authStore";
import useLangStore, { useT } from "../store/langStore";

export default function Sidebar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
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
    <aside className="flex flex-col w-64 h-full bg-black p-4 gap-4 shrink-0 overflow-hidden">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-2">
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-spotify-green">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        <span className="text-white font-bold text-xl">Spotify</span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        <Link to="/" className="flex items-center gap-3 px-2 py-2 rounded text-spotify-muted hover:text-white transition-colors">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3z" />
          </svg>
          {t.home}
        </Link>
        <Link to="/search" className="flex items-center gap-3 px-2 py-2 rounded text-spotify-muted hover:text-white transition-colors">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          {t.search}
        </Link>
        {user && (
          <Link to="/liked" className="flex items-center gap-3 px-2 py-2 rounded text-spotify-muted hover:text-white transition-colors">
            <svg className="w-5 h-5 fill-spotify-green" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {t.likedSongs}
          </Link>
        )}
      </nav>

      {/* Library */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-semibold text-spotify-muted uppercase tracking-widest">{t.myLibrary}</span>
          {user && (
            <button
              onClick={() => setCreating(true)}
              className="text-spotify-muted hover:text-white text-xl leading-none"
              title={t.addPlaylist}
            >
              +
            </button>
          )}
        </div>

        {creating && (
          <form onSubmit={handleCreate} className="flex gap-1 mb-2 px-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.enterName}
              className="flex-1 bg-spotify-card text-white text-sm px-2 py-1 rounded outline-none"
            />
            <button type="submit" className="text-spotify-green text-sm font-bold">{t.add}</button>
          </form>
        )}

        {user ? (
          playlists.map((pl) => (
            <Link
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className="block px-2 py-1.5 text-sm text-spotify-muted hover:text-white truncate transition-colors"
            >
              {pl.name}
            </Link>
          ))
        ) : (
          <p className="px-2 text-xs text-spotify-muted leading-relaxed whitespace-pre-line">
            {t.loginToCreate}
          </p>
        )}
      </div>

      {/* Language switcher */}
      <div className="border-t border-spotify-hover pt-3">
        <button
          onClick={() => setLang(lang === "ko" ? "en" : "ko")}
          className="flex items-center gap-2 text-xs text-spotify-muted hover:text-white transition-colors w-full px-2 py-1"
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
