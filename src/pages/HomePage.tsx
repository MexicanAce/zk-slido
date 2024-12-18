import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { RoomJoin } from "../components/RoomJoin";
import { Header } from "../components/layout/Header";
import { useRoomStore } from "../store/useRoomStore";
import { useWeb3Store } from "../store/useWeb3Store";

export function HomePage() {
  const navigate = useNavigate();
  const { createRoom, isLoading, error } = useRoomStore();
  const { connect } = useWeb3Store();

  const handleCreateRoom = async () => {
    await createRoom(`New Room - ${new Date().toDateString()}`);
    const roomId = useRoomStore.getState().currentRoomId;
    if (roomId) {
      navigate(`/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Q&A Platform"
        onLoginClick={() => {
          connect();
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Create a New Room</h2>
            <p className="text-gray-600">
              Start a new Q&A session and share the link with your audience.
            </p>
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Create Room
            </button>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <RoomJoin />
          </div>
        </div>
        {error && (
          <div className="text-red-500 items-center flex justify-center mt-8 text-lg">
            {error}
            {error?.endsWith("invalid session") && (
              <span className="ml-1.5 italic text-slate-600">
                (Please disconnect & login)
              </span>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
