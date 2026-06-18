import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAlbum } from "../api/tracks";
import { getLikedTracks } from "../api/likes";
import TrackList from "../components/TrackList";
import useAuthStore from "../store/authStore";

export default function AlbumPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [album, setAlbum] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await getAlbum(id);
      setAlbum(data);
      if (user) {
        const { data: liked } = await getLikedTracks();
        setLikedIds(new Set(liked.map((t) => t.id)));
      }
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [id, user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-spotify-muted">로딩 중...</div>;
  if (!album) return <p className="text-spotify-muted p-8">앨범을 찾을 수 없습니다.</p>;

  return (
    <div className="pb-32">
      <div className="flex items-end gap-6 p-8 bg-gradient-to-b from-spotify-card to-spotify-black">
        <div className="w-48 h-48 bg-spotify-hover flex items-center justify-center rounded shadow-2xl shrink-0 overflow-hidden">
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-16 h-16 fill-spotify-muted" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-xs text-white uppercase font-semibold mb-1">앨범</p>
          <h1 className="text-4xl font-bold text-white mb-2">{album.title}</h1>
          <p className="text-spotify-muted text-sm">
            <Link to={`/artist/${album.artist?.id}`} className="text-white hover:underline font-semibold">
              {album.artist?.name}
            </Link>
            {album.release_date && ` · ${album.release_date.slice(0, 4)}`}
            {` · ${album.tracks.length}곡`}
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        <TrackList tracks={album.tracks} likedIds={likedIds} />
      </div>
    </div>
  );
}
