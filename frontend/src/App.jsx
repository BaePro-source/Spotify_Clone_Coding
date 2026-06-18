import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PlaylistPage from "./pages/PlaylistPage";
import ArtistPage from "./pages/ArtistPage";
import AlbumPage from "./pages/AlbumPage";
import LikedPage from "./pages/LikedPage";
import useAuthStore from "./store/authStore";

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-spotify-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-card to-spotify-black">
        {children}
      </main>
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
          <RequireAuth>
            <Layout><PlaylistPage /></Layout>
          </RequireAuth>
        } />
        <Route path="/liked" element={
          <RequireAuth>
            <Layout><LikedPage /></Layout>
          </RequireAuth>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
