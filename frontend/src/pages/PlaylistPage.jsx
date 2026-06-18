import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlaylist, updatePlaylist, deletePlaylist } from "../api/playlists";
import TrackList from "../components/TrackList";
import { getLikedTracks } from "../api/likes";
import useAuthStore from "../store/authStore";

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [playlist, setPlaylist] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getPlaylist(id);
        setPlaylist(data);
        setName(data.name);
        if (user) {
          const { data: liked } = await getLikedTracks();
          setLikedIds(new Set(liked.map((t) => t.id)));
        }
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const handleSaveName = async () => {
    const { data } = await updatePlaylist(id, { name });
    setPlaylist(data);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("플레이리스트를 삭제할까요?")) return;
    await deletePlaylist(id);
    navigate("/");
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-spotify-muted">로딩 중...</div>;
  if (!playlist) return null;

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-end gap-6 p-8 bg-gradient-to-b from-spotify-card to-spotify-black">
        <div className="w-48 h-48 bg-spotify-hover flex items-center justify-center rounded shadow-2xl shrink-0">
          <svg className="w-16 h-16 fill-spotify-muted" viewBox="0 0 24 24">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white uppercase font-semibold mb-1">플레이리스트</p>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-b border-white text-4xl font-bold text-white outline-none"
              />
              <button onClick={handleSaveName} className="text-spotify-green text-sm">저장</button>
              <button onClick={() => setEditing(false)} className="text-spotify-muted text-sm">취소</button>
            </div>
          ) : (
            <h1
              className="text-4xl font-bold text-white cursor-pointer hover:underline truncate"
              onClick={() => setEditing(true)}
            >
              {playlist.name}
            </h1>
          )}
          <p className="text-spotify-muted text-sm mt-2">{playlist.tracks.length}곡</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-8 py-4">
        <button
          onClick={handleDelete}
          className="text-spotify-muted hover:text-white text-sm border border-spotify-muted hover:border-white px-4 py-1 rounded-full transition-colors"
        >
          삭제
        </button>
      </div>

      {/* Tracks */}
      {playlist.tracks.length > 0 ? (
        <div className="px-4">
          <TrackList tracks={playlist.tracks} likedIds={likedIds} />
        </div>
      ) : (
        <p className="text-spotify-muted text-center mt-12">
          아직 트랙이 없습니다. 검색 페이지에서 트랙을 추가해 보세요.
        </p>
      )}
    </div>
  );
}
