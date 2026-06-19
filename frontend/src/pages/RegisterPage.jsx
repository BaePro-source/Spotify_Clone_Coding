import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import useAuthStore from "../store/authStore";
import { useT } from "../store/langStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setToken, fetchMe } = useAuthStore();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const t = useT();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await register(form);
      setToken(data.access_token);
      await fetchMe();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || t.signupFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-spotify-black">
      <div className="w-full max-w-sm bg-spotify-dark rounded-xl p-8">
        <div className="flex justify-center mb-6">
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-spotify-green">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-8">{t.registerTitle}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-white mb-1">{t.email}</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t.emailPlaceholder}
              className="w-full bg-spotify-hover text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-spotify-green"
            />
          </div>
          <div>
            <label className="block text-sm text-white mb-1">{t.username}</label>
            <input
              type="text" required value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder={t.usernamePlaceholder}
              className="w-full bg-spotify-hover text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-spotify-green"
            />
          </div>
          <div>
            <label className="block text-sm text-white mb-1">{t.password}</label>
            <input
              type="password" required minLength={6} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t.passwordLongPlaceholder}
              className="w-full bg-spotify-hover text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-spotify-green"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-60 mt-2">
            {loading ? t.signingUp : t.signupLong}
          </button>
        </form>

        <p className="text-center text-spotify-muted text-sm mt-6">
          {t.hasAccount}{" "}
          <Link to="/login" className="text-white hover:underline">{t.login}</Link>
        </p>
      </div>
    </div>
  );
}
