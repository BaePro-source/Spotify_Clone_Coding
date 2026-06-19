import TrackRow from "./TrackRow";
import { useT } from "../store/langStore";

export default function TrackList({ tracks = [], likedIds = new Set(), onLikeChange }) {
  const t = useT();
  return (
    <div className="flex flex-col">
      <div
        className="grid px-4 py-2 border-b border-spotify-hover text-xs text-spotify-muted mb-2"
        style={{ gridTemplateColumns: "1.5rem 2.5rem 1fr auto auto" }}
      >
        <span>#</span>
        <span />
        <span>{t.colTitle}</span>
        <span className="hidden md:block w-24">{t.colGenre}</span>
        <span>{t.colTime}</span>
      </div>
      {tracks.map((track, i) => (
        <TrackRow
          key={track.id}
          track={track}
          index={i}
          liked={likedIds.has(track.id)}
          onLikeChange={onLikeChange}
          contextTracks={tracks}
        />
      ))}
    </div>
  );
}
