import { useEffect, useState } from "react";
import { getLikedTracks } from "../api/likes";
import TrackList from "../components/TrackList";

export default function LikedPage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLikedTracks()
      .then(({ data }) => setTracks(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-spotify-muted">로딩 중...</div>;

  return (
    <div className="pb-32">
      <div className="flex items-end gap-6 p-8 bg-gradient-to-b from-purple-900 to-spotify-black">
        <div className="w-48 h-48 flex items-center justify-center rounded shadow-2xl shrink-0"
          style={{ background: "linear-gradient(135deg, #450af5, #c4efd9)" }}>
          <svg className="w-20 h-20 fill-white" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-white uppercase font-semibold mb-1">플레이리스트</p>
          <h1 className="text-4xl font-bold text-white mb-2">좋아요한 곡</h1>
          <p className="text-spotify-muted text-sm">{tracks.length}곡</p>
        </div>
      </div>

      <div className="px-4 mt-4">
        {tracks.length > 0 ? (
          <TrackList tracks={tracks} likedIds={new Set(tracks.map((t) => t.id))} />
        ) : (
          <p className="text-spotify-muted text-center mt-12">아직 좋아요한 곡이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
