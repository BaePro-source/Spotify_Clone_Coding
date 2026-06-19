import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getTracks } from "../api/tracks";
import { getLikedTracks } from "../api/likes";
import { getHistory } from "../api/history";
import TrackList from "../components/TrackList";
import useAuthStore from "../store/authStore";
import usePlayerStore from "../store/playerStore";
import { useT } from "../store/langStore";

/* ── 공통 play 버튼 오버레이 ── */
function PlayOverlay({ isActive, isPlaying }) {
  return (
    <div className={`absolute inset-0 bg-black/40 flex items-end justify-end p-3 transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
      <div className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
        {isActive && isPlaying ? (
          <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-4 h-4 fill-black ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </div>
    </div>
  );
}

/* ── 인기 상승 곡 카드 ── */
function TrackCard({ track, allTracks }) {
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  return (
    <div
      className="group flex flex-col gap-3 p-3 bg-spotify-card hover:bg-spotify-hover rounded-lg transition-colors cursor-pointer"
      onClick={() => playTrack(track, allTracks)}
    >
      <div className="relative w-full aspect-square bg-spotify-hover rounded overflow-hidden">
        {track.album?.cover_url ? (
          <img src={track.album.cover_url} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 fill-spotify-muted" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
          </div>
        )}
        <PlayOverlay isActive={isActive} isPlaying={isPlaying} />
      </div>
      <div>
        <p className={`text-sm font-semibold truncate ${isActive ? "text-spotify-green" : "text-white"}`}>
          {track.title}
        </p>
        <p className="text-xs text-spotify-muted truncate mt-0.5">{track.artist?.name}</p>
      </div>
    </div>
  );
}

/* ── 아티스트 카드 ── */
function ArtistCard({ artist }) {
  return (
    <Link
      to={`/artist/${artist.id}`}
      className="group flex flex-col items-center gap-3 p-3 bg-spotify-card hover:bg-spotify-hover rounded-lg transition-colors"
    >
      <div className="relative w-full aspect-square rounded-full overflow-hidden bg-spotify-hover">
        {artist.image_url ? (
          <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 fill-spotify-muted" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-center w-full">
        <p className="text-sm font-semibold text-white truncate">{artist.name}</p>
        <ArtistLabel />
      </div>
    </Link>
  );
}

/* ── 앨범 카드 ── */
function AlbumCard({ album }) {
  return (
    <Link
      to={`/album/${album.id}`}
      className="group flex flex-col gap-3 p-3 bg-spotify-card hover:bg-spotify-hover rounded-lg transition-colors"
    >
      <div className="relative w-full aspect-square bg-spotify-hover rounded overflow-hidden">
        {album.cover_url ? (
          <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 fill-spotify-muted" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
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
      <div>
        <p className="text-sm font-semibold text-white truncate">{album.title}</p>
        <p className="text-xs text-spotify-muted truncate mt-0.5">{album.artist_name}</p>
      </div>
    </Link>
  );
}

/* ── 섹션 헤더 ── */
function SectionHeader({ title }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
  );
}

function ArtistLabel() {
  const t = useT();
  return <p className="text-xs text-spotify-muted mt-0.5">{t.artist}</p>;
}

/* ── 6열 그리드 ── */
function CardGrid({ children }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {children}
    </div>
  );
}

/* ── 최근 재생 빠른 카드 (로그인 시) ── */
function QuickCard({ track, allTracks }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  return (
    <div
      className="group flex items-center gap-3 bg-spotify-card hover:bg-spotify-hover rounded overflow-hidden cursor-pointer transition-colors"
      onClick={() => isActive ? togglePlay() : playTrack(track, allTracks)}
    >
      <div className="w-16 h-16 bg-spotify-hover flex items-center justify-center shrink-0 relative overflow-hidden">
        {track.album?.cover_url ? (
          <img src={track.album.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-6 h-6 fill-spotify-muted" viewBox="0 0 24 24">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        )}
      </div>
      <span className={`text-sm font-semibold truncate pr-2 ${isActive ? "text-spotify-green" : "text-white"}`}>
        {track.title}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
export default function HomePage() {
  const { user } = useAuthStore();
  const [tracks, setTracks] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [recentTracks, setRecentTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tracksRes = await getTracks();
        setTracks(tracksRes.data);

        if (user) {
          const [likesRes, historyRes] = await Promise.all([getLikedTracks(), getHistory()]);
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

  const genres = useMemo(() => {
    const genreSet = new Set(tracks.map((t) => t.genre).filter(Boolean));
    return [...genreSet].sort();
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    return selectedGenre === "all" ? tracks : tracks.filter((t) => t.genre === selectedGenre);
  }, [tracks, selectedGenre]);

  const filteredArtists = useMemo(() => {
    return [...new Map(filteredTracks.map((t) => [t.artist.id, t.artist])).values()];
  }, [filteredTracks]);

  const filteredAlbums = useMemo(() => {
    return [
      ...new Map(
        filteredTracks.map((t) => [t.album.id, { ...t.album, artist_name: t.artist.name }])
      ).values(),
    ];
  }, [filteredTracks]);

  const t = useT();

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-spotify-muted">{t.loading}</div>;
  }

  return (
    <div className="p-6 pb-8">

      {/* 장르 필터 탭 */}
      {genres.length > 0 && (
        <div className="mb-8 overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max">
            {["all", ...genres].map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedGenre === genre
                    ? "bg-white text-black"
                    : "bg-spotify-hover text-white hover:bg-spotify-card"
                }`}
              >
                {genre === "all" ? t.genreAll : genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 최근 재생 — 로그인 후에만 */}
      {user && recentTracks.length > 0 && (
        <section className="mb-8">
          <SectionHeader title={t.recentlyPlayed} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {recentTracks.map((track) => (
              <QuickCard key={track.id} track={track} allTracks={tracks} />
            ))}
          </div>
        </section>
      )}

      {/* 인기 상승 곡 */}
      {filteredTracks.length > 0 && (
        <section className="mb-8">
          <SectionHeader title={t.popularTracks} />
          <CardGrid>
            {filteredTracks.slice(0, 6).map((track) => (
              <TrackCard key={track.id} track={track} allTracks={filteredTracks} />
            ))}
          </CardGrid>
        </section>
      )}

      {/* 인기 아티스트 */}
      {filteredArtists.length > 0 && (
        <section className="mb-8">
          <SectionHeader title={t.popularArtists} />
          <CardGrid>
            {filteredArtists.slice(0, 6).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </CardGrid>
        </section>
      )}

      {/* 인기 앨범 */}
      {filteredAlbums.length > 0 && (
        <section className="mb-8">
          <SectionHeader title={t.popularAlbums} />
          <CardGrid>
            {filteredAlbums.slice(0, 6).map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </CardGrid>
        </section>
      )}

      {/* 전체 트랙 */}
      <section>
        <SectionHeader title={t.allTracks} />
        {filteredTracks.length > 0 ? (
          <TrackList tracks={filteredTracks} likedIds={likedIds} />
        ) : (
          <p className="text-spotify-muted text-sm py-8 text-center">{t.noResultsTitle}</p>
        )}
      </section>

    </div>
  );
}
