import TrackRow from "./TrackRow";

export default function TrackList({ tracks = [], likedIds = new Set() }) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="grid px-4 py-2 border-b border-spotify-hover text-xs text-spotify-muted mb-2" style={{ gridTemplateColumns: "1.5rem 2.5rem 1fr auto auto" }}>
        <span>#</span>
        <span />
        <span>제목</span>
        <span className="hidden md:block w-24">장르</span>
        <span>시간</span>
      </div>
      {tracks.map((track, i) => (
        <TrackRow
          key={track.id}
          track={track}
          index={i}
          liked={likedIds.has(track.id)}
        />
      ))}
    </div>
  );
}
