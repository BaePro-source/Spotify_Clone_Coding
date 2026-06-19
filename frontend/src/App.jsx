import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import TopNav from "./components/TopNav";
import QueuePanel from "./components/QueuePanel";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PlaylistPage from "./pages/PlaylistPage";
import ArtistPage from "./pages/ArtistPage";
import AlbumPage from "./pages/AlbumPage";
import LikedPage from "./pages/LikedPage";
import useAuthStore from "./store/authStore";
import usePlayerStore from "./store/playerStore";
import { useT } from "./store/langStore";

function LoginBanner() {
  const user = useAuthStore((s) => s.user);
  const t = useT();
  if (user) return null;
  return (
    <div className="flex items-center justify-between gap-4 px-8 py-4 bg-gradient-to-r from-[#af2896] to-[#509bf5] shrink-0">
      <div>
        <p className="text-white font-bold text-sm">{t.previewTitle}</p>
        <p className="text-xs text-white/80 mt-0.5">{t.previewDesc}</p>
      </div>
      <Link
        to="/register"
        className="shrink-0 px-7 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform"
      >
        {t.signupFree}
      </Link>
    </div>
  );
}

function Layout({ children }) {
  const showQueue = usePlayerStore((s) => s.showQueue);
  return (
    <div className="flex flex-col h-screen bg-spotify-black overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNav />
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-card to-spotify-black">
              {children}
            </main>
            {showQueue && <QueuePanel />}
          </div>
        </div>
      </div>
      <LoginBanner />
      <Player />
    </div>
  );
}

function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />
        <Route path="/artist/:id" element={<Layout><ArtistPage /></Layout>} />
        <Route path="/album/:id" element={<Layout><AlbumPage /></Layout>} />

        <Route path="/playlist/:id" element={
          <RequireAuth><Layout><PlaylistPage /></Layout></RequireAuth>
        } />
        <Route path="/liked" element={
          <RequireAuth><Layout><LikedPage /></Layout></RequireAuth>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
