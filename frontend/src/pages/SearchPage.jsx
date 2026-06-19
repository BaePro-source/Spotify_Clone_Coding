import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getTracks } from "../api/tracks";
import { getLikedTracks } from "../api/likes";
import TrackList from "../components/TrackList";
import useAuthStore from "../store/authStore";
import { useT } from "../store/langStore";

export default function SearchPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [tracks, setTracks] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const t = useT();

  const query = searchParams.get("q") || "";

  useEffect(() => {
    if (!query.trim()) { setTracks([]); return; }
    setLoading(true);
    const doSearch = async () => {
      try {
        const tracksRes = await getTracks(query);
        setTracks(tracksRes.data);
        if (user) {
          const { data } = await getLikedTracks();
          setLikedIds(new Set(data.map((t) => t.id)));
        }
      } finally {
        setLoading(false);
      }
    };
    doSearch();
  }, [query, user]);

  return (
    <div className="p-6 pb-8">
      {!query && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <svg className="w-16 h-16 text-spotify-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="6" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <p className="text-spotify-muted text-lg">{t.searchHint}</p>
        </div>
      )}

      {loading && <p className="text-spotify-muted">{t.searching}</p>}

      {!loading && query && tracks.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            "{query}" {t.searchResultsLabel}
            <span className="text-spotify-muted text-sm font-normal ml-2">{tracks.length} {t.songs}</span>
          </h2>
          <TrackList tracks={tracks} likedIds={likedIds} />
        </section>
      )}

      {!loading && query && tracks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-white text-lg font-semibold">{t.noResultsTitle}</p>
          <p className="text-spotify-muted">"{query}" {t.noResultsDesc}</p>
        </div>
      )}
    </div>
  );
}
