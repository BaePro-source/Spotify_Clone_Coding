import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getTracks } from "../api/tracks";
import { getLikedTracks } from "../api/likes";
import TrackList from "../components/TrackList";
import useAuthStore from "../store/authStore";

export default function SearchPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [tracks, setTracks] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const doSearch = async (q) => {
    if (!q.trim()) {
      setTracks([]);
      return;
    }
    setLoading(true);
    try {
      const [tracksRes] = await Promise.all([getTracks(q)]);
      setTracks(tracksRes.data);
      if (user) {
        const { data } = await getLikedTracks();
        setLikedIds(new Set(data.map((t) => t.id)));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    doSearch(query);
  };

  return (
    <div className="p-6 pb-32">
      <h1 className="text-2xl font-bold text-white mb-6">검색</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <div className="relative flex-1 max-w-lg">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-spotify-muted" viewBox="0 0 24 24">
            <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="트랙 제목, 아티스트 검색"
            className="w-full bg-white text-black rounded-full pl-10 pr-4 py-2.5 outline-none text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-white text-black rounded-full font-semibold text-sm hover:scale-105 transition-transform"
        >
          검색
        </button>
      </form>

      {loading && <p className="text-spotify-muted">검색 중...</p>}

      {!loading && tracks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            검색 결과 <span className="text-spotify-muted text-sm">({tracks.length}곡)</span>
          </h2>
          <TrackList tracks={tracks} likedIds={likedIds} />
        </section>
      )}

      {!loading && query && tracks.length === 0 && (
        <p className="text-spotify-muted text-center mt-12">
          "{query}"에 대한 검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
}
