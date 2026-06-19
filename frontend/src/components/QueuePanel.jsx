import usePlayerStore from "../store/playerStore";
import { useT } from "../store/langStore";

function QueueItem({ track, isActive, onJump, index }) {
  return (
    <div
      onClick={() => onJump && onJump(index)}
      className={`flex items-center gap-3 px-4 py-2 mx-1 rounded-md transition-colors ${
        onJump ? "cursor-pointer hover:bg-spotify-hover" : "cursor-default"
      }`}
    >
      <div className="w-10 h-10 rounded bg-spotify-hover shrink-0 overflow-hidden">
        {track.album?.cover_url ? (
          <img src={track.album.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-4 h-4 fill-spotify-muted" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${isActive ? "text-spotify-green" : "text-white"}`}>
          {track.title}
        </p>
        <p className="text-xs text-spotify-muted truncate">{track.artist?.name}</p>
      </div>
    </div>
  );
}

export default function QueuePanel() {
  const { queue, queueIndex, currentTrack, showQueue, toggleQueue, jumpToQueue } = usePlayerStore();
  const t = useT();

  if (!showQueue) return null;

  const upNext = queue.slice(queueIndex + 1);

  return (
    <div className="w-72 flex flex-col bg-spotify-dark border-l border-spotify-hover overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-4 py-4 border-b border-spotify-hover shrink-0">
        <h2 className="text-white font-bold">{t.queueTitle}</h2>
        <button
          onClick={toggleQueue}
          className="text-spotify-muted hover:text-white transition-colors p-1 rounded hover:bg-spotify-hover"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto flex-1 py-2">
        {currentTrack && (
          <div className="mb-4">
            <p className="px-4 py-1 text-xs font-bold text-spotify-green uppercase tracking-wider">
              {t.nowPlayingLabel}
            </p>
            <QueueItem track={currentTrack} isActive />
          </div>
        )}

        {upNext.length > 0 ? (
          <div>
            <p className="px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
              {t.nextUpLabel}
            </p>
            {upNext.map((track, i) => (
              <QueueItem
                key={`${track.id}-${i}`}
                track={track}
                index={queueIndex + 1 + i}
                onJump={jumpToQueue}
              />
            ))}
          </div>
        ) : (
          !currentTrack && (
            <p className="text-spotify-muted text-sm px-4 py-2">{t.emptyQueue}</p>
          )
        )}

        {currentTrack && upNext.length === 0 && (
          <p className="text-spotify-muted text-sm px-4 py-2">{t.emptyQueue}</p>
        )}
      </div>
    </div>
  );
}
