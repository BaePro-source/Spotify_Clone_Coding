import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAlbum } from "../api/tracks";
import { getLikedTracks } from "../api/likes";
import TrackList from "../components/TrackList";
import useAuthStore from "../store/authStore";
import usePlayerStore from "../store/playerStore";
import { useT } from "../store/langStore";
import useLangStore from "../store/langStore";

function formatTotalDuration(tracks, lang) {
  const totalSecs = tracks.reduce((sum, tr) => sum + (tr.duration || 0), 0);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  if (lang === "ko") {
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  }
  return h > 0 ? `${h} hr ${m} min` : `${m} min`;
}

export default function AlbumPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { playTrack } = usePlayerStore();
  const lang = useLangStore((s) => s.lang);
  const [album, setAlbum] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    const load = async () => {
      const { data } = await getAlbum(id);
      setAlbum(data);
      if (user) {
        const { data: liked } = await getLikedTracks();
        setLikedIds(new Set(liked.map((tr) => tr.id)));
      }
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [id, user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-spotify-muted">{t.loading}</div>;
  if (!album) return <p className="text-spotify-muted p-8">{t.albumNotFound}</p>;

  const durationStr = formatTotalDuration(album.tracks, lang);

  return (
    <div className="pb-32">
      {/* Hero */}
      <div className="flex items-end gap-6 p-8 bg-gradient-to-b from-[#3d3d3d] to-spotify-black min-h-56">
        <div className="w-44 h-44 bg-spotify-hover flex items-center justify-center rounded shadow-2xl shrink-0 overflow-hidden">
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-16 h-16 fill-spotify-muted" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-xs text-white uppercase font-semibold mb-2 tracking-widest">{t.albumsLabel}</p>
          <h1 className="text-4xl font-bold text-white mb-3">{album.title}</h1>
          <p className="text-spotify-muted text-sm flex items-center gap-1 flex-wrap">
            <Link
              to={`/artist/${album.artist?.id}`}
              className="text-white hover:underline font-semibold"
            >
              {album.artist?.name}
            </Link>
            {album.release_date && <span>· {album.release_date.slice(0, 4)}</span>}
            <span>· {album.tracks.length} {t.songs}</span>
            <span>· {durationStr}</span>
          </p>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-8 py-6 flex items-center gap-6">
        <button
          onClick={() => album.tracks.length > 0 && playTrack(album.tracks[0], album.tracks)}
          title={t.playAll}
          className="w-14 h-14 rounded-full bg-spotify-green flex items-center justify-center shadow-xl hover:scale-105 transition-transform disabled:opacity-40"
          disabled={album.tracks.length === 0}
        >
          <svg className="w-6 h-6 fill-black ml-1" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      <div className="px-4">
        <TrackList tracks={album.tracks} likedIds={likedIds} />
      </div>
    </div>
  );
}
