import { useEffect, useState } from "react";
import { getTracks } from "../api/tracks";
import { getLikedTracks } from "../api/likes";
import { getHistory } from "../api/history";
import TrackList from "../components/TrackList";
import useAuthStore from "../store/authStore";
import usePlayerStore from "../store/playerStore";

function RecentCard({ track }) {
  const playTrack = usePlayerStore((s) => s.playTrack);
  return (
    <div
      className="flex items-center gap-3 bg-spotify-card hover:bg-spotify-hover rounded overflow-hidden cursor-pointer transition-colors"
      onClick={() => playTrack(track)}
    >
      <div className="w-16 h-16 bg-spotify-hover flex items-center justify-center shrink-0">
        <svg className="w-6 h-6 fill-spotify-muted" viewBox="0 0 24 24">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      </div>
      <span className="text-white text-sm font-semibold truncate pr-2">{track.title}</span>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuthStore();
  const [tracks, setTracks] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [recentTracks, setRecentTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tracksRes] = await Promise.all([getTracks()]);
        setTracks(tracksRes.data);

        if (user) {
          const [likesRes, historyRes] = await Promise.all([
            getLikedTracks(),
            getHistory(),
          ]);
          setLikedIds(new Set(likesRes.data.map((t) => t.id)));
          const seen = new Set();
          const unique = [];
          for (const entry of historyRes.data) {
            if (!seen.has(entry.track.id)) {
              seen.add(entry.track.id);
              unique.push(entry.track);
            }
          }
          setRecentTracks(unique.slice(0, 6));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-spotify-muted">로딩 중...</div>;
  }

  return (
    <div className="p-6 pb-32">
      {recentTracks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">최근 재생</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {recentTracks.map((track) => (
              <RecentCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">전체 트랙</h2>
        <TrackList tracks={tracks} likedIds={likedIds} />
      </section>
    </div>
  );
}
