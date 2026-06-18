import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPlaylists, createPlaylist } from "../api/playlists";
import useAuthStore from "../store/authStore";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (user) {
      getPlaylists().then((r) => setPlaylists(r.data)).catch(() => {});
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex flex-col w-64 min-h-full bg-black p-4 gap-4 shrink-0">
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
          홈
        </Link>
        <Link to="/search" className="flex items-center gap-3 px-2 py-2 rounded text-spotify-muted hover:text-white transition-colors">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          검색
        </Link>
        {user && (
          <Link to="/liked" className="flex items-center gap-3 px-2 py-2 rounded text-spotify-muted hover:text-white transition-colors">
            <svg className="w-5 h-5 fill-spotify-green" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            좋아요한 곡
          </Link>
        )}
      </nav>

      {/* Playlists */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-semibold text-spotify-muted uppercase tracking-widest">내 플레이리스트</span>
          {user && (
            <button
              onClick={() => setCreating(true)}
              className="text-spotify-muted hover:text-white text-xl leading-none"
              title="플레이리스트 추가"
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
              placeholder="이름 입력"
              className="flex-1 bg-spotify-card text-white text-sm px-2 py-1 rounded outline-none"
            />
            <button type="submit" className="text-spotify-green text-sm font-bold">추가</button>
          </form>
        )}

        {user ? (
          playlists.map((pl) => (
            <Link
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className="block px-2 py-1 text-sm text-spotify-muted hover:text-white truncate transition-colors"
            >
              {pl.name}
            </Link>
          ))
        ) : (
          <p className="px-2 text-xs text-spotify-muted">로그인하면 플레이리스트를 만들 수 있어요</p>
        )}
      </div>

      {/* User */}
      <div className="border-t border-spotify-hover pt-4">
        {user ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-white truncate">{user.username}</span>
            <button onClick={handleLogout} className="text-xs text-spotify-muted hover:text-white">로그아웃</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="flex-1 text-center py-1 rounded border border-spotify-muted text-white text-sm hover:border-white transition-colors">로그인</Link>
            <Link to="/register" className="flex-1 text-center py-1 rounded bg-white text-black text-sm font-semibold hover:scale-105 transition-transform">가입</Link>
          </div>
        )}
      </div>
    </aside>
  );
}
