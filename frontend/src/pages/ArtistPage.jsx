import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getArtist } from "../api/tracks";
import { getLikedTracks } from "../api/likes";
import TrackList from "../components/TrackList";
import useAuthStore from "../store/authStore";

export default function ArtistPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [artist, setArtist] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await getArtist(id);
      setArtist(data);
      if (user) {
        const { data: liked } = await getLikedTracks();
        setLikedIds(new Set(liked.map((t) => t.id)));
      }
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [id, user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-spotify-muted">로딩 중...</div>;
  if (!artist) return <p className="text-spotify-muted p-8">아티스트를 찾을 수 없습니다.</p>;

  return (
    <div className="pb-32">
      <div className="flex items-end gap-6 p-8 bg-gradient-to-b from-spotify-card to-spotify-black">
        <div className="w-48 h-48 rounded-full bg-spotify-hover flex items-center justify-center overflow-hidden shrink-0">
          {artist.image_url ? (
            <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-20 h-20 fill-spotify-muted" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-xs text-white uppercase font-semibold mb-1">아티스트</p>
          <h1 className="text-5xl font-bold text-white mb-2">{artist.name}</h1>
          <p className="text-spotify-muted text-sm">{artist.tracks.length}개의 트랙</p>
        </div>
      </div>

      <section className="px-4 mt-4">
        <h2 className="text-2xl font-bold text-white mb-4 px-4">인기 트랙</h2>
        <TrackList tracks={artist.tracks} likedIds={likedIds} />
      </section>

      {artist.albums.length > 0 && (
        <section className="px-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">앨범</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {artist.albums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="bg-spotify-card hover:bg-spotify-hover p-4 rounded-lg transition-colors"
              >
                <div className="w-full aspect-square bg-spotify-hover flex items-center justify-center rounded mb-3">
                  <svg className="w-12 h-12 fill-spotify-muted" viewBox="0 0 24 24">
                    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                  </svg>
                </div>
                <p className="text-white font-semibold text-sm truncate">{album.title}</p>
                <p className="text-spotify-muted text-xs mt-1">{album.release_date?.slice(0, 4)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
