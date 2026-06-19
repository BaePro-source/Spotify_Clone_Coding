import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getArtist } from "../api/tracks";
import { getLikedTracks } from "../api/likes";
import TrackList from "../components/TrackList";
import useAuthStore from "../store/authStore";
import usePlayerStore from "../store/playerStore";
import { useT } from "../store/langStore";

export default function ArtistPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { playTrack } = usePlayerStore();
  const [artist, setArtist] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    const load = async () => {
      const { data } = await getArtist(id);
      setArtist(data);
      if (user) {
        const { data: liked } = await getLikedTracks();
        setLikedIds(new Set(liked.map((tr) => tr.id)));
      }
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [id, user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-spotify-muted">{t.loading}</div>;
  if (!artist) return <p className="text-spotify-muted p-8">{t.artistNotFound}</p>;

  return (
    <div className="pb-32">
      {/* Hero */}
      <div className="flex items-end gap-6 p-8 bg-gradient-to-b from-[#3d3d3d] to-spotify-black min-h-56">
        <div className="w-44 h-44 rounded-full bg-spotify-hover flex items-center justify-center overflow-hidden shrink-0 shadow-2xl">
          {artist.image_url ? (
            <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-20 h-20 fill-spotify-muted" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-xs text-white uppercase font-semibold mb-2 tracking-widest">{t.artist}</p>
          <h1 className="text-5xl font-bold text-white mb-3">{artist.name}</h1>
          <p className="text-spotify-muted text-sm">{artist.tracks.length} {t.songs}</p>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-8 py-6 flex items-center gap-6">
        <button
          onClick={() => artist.tracks.length > 0 && playTrack(artist.tracks[0], artist.tracks)}
          title={t.playAll}
          className="w-14 h-14 rounded-full bg-spotify-green flex items-center justify-center shadow-xl hover:scale-105 transition-transform disabled:opacity-40"
          disabled={artist.tracks.length === 0}
        >
          <svg className="w-6 h-6 fill-black ml-1" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Popular tracks */}
      <section className="px-4">
        <h2 className="text-2xl font-bold text-white mb-4 px-4">{t.topTracks}</h2>
        <TrackList tracks={artist.tracks} likedIds={likedIds} />
      </section>

      {/* Albums */}
      {artist.albums.length > 0 && (
        <section className="px-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t.albumsLabel}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artist.albums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="group bg-spotify-card hover:bg-spotify-hover p-4 rounded-lg transition-colors"
              >
                <div className="relative w-full aspect-square bg-spotify-hover rounded mb-3 overflow-hidden">
                  {album.cover_url ? (
                    <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 fill-spotify-muted" viewBox="0 0 24 24">
                        <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                      <svg className="w-4 h-4 fill-black ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
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
