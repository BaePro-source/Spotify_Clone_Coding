import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useT } from "../store/langStore";

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuthStore();
  const t = useT();

  const isSearchPage = location.pathname === "/search";
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(isSearchPage ? (searchParams.get("q") || "") : "");
  }, [location.pathname, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center gap-4 px-6 h-16 bg-black/60 backdrop-blur-sm shrink-0 z-10">
      {/* Back / Forward */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 text-xl leading-none"
        >
          ‹
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 text-xl leading-none"
        >
          ›
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-white text-black rounded-full pl-10 pr-4 py-2 text-sm outline-none"
          />
        </div>
      </form>

      {/* User section */}
      <div className="ml-auto flex items-center gap-3 shrink-0">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-spotify-green flex items-center justify-center text-black font-bold text-sm select-none">
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-white font-medium hidden lg:block">{user.username}</span>
            </div>
            <button onClick={handleLogout} className="text-xs text-spotify-muted hover:text-white transition-colors">
              {t.logout}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/register" className="text-sm text-white font-semibold hover:text-spotify-green transition-colors">
              {t.signupLong}
            </Link>
            <Link to="/login" className="px-5 py-1.5 rounded-full bg-white text-black text-sm font-bold hover:scale-105 transition-transform">
              {t.login}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
