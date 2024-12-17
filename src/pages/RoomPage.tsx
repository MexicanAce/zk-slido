import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { QuestionInput } from "../components/QuestionInput";
import { QuestionList } from "../components/QuestionList";
import { Header } from "../components/layout/Header";
import { useWeb3Store } from "../store/useWeb3Store";
import { useRoomStore } from "../store/useRoomStore";
import { useRoomAdmin } from "../hooks/useRoomAdmin";
import { useRoomSetup } from "../hooks/useRoomSetup";
import { useQuestions } from "../hooks/useQuestions";
import { PlusCircle, RefreshCw } from "lucide-react";
import { shortenAddress } from "../utils/misc";
import { AddAdminModal } from "../components/AddAdminModal";

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [displayShareSuccess, setDisplayShareSuccess] = useState(false);
  const { address, connect } = useWeb3Store();
  const { admins, isAdmin, checkIsAdmin } = useRoomStore();
  const { isLoading, error, refresh } = useQuestions(roomId);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);

  useRoomSetup(roomId);
  useRoomAdmin(roomId);

  if (!roomId) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    checkIsAdmin(roomId, address!);
  }, []);

  function onShareClicked() {
    navigator.clipboard.writeText(window.location.href);
    setDisplayShareSuccess(true);
    setTimeout(() => {
      setDisplayShareSuccess(false);
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Q&A Platform"
        onLoginClick={async () => {
          await connect();
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center">
              <h1 className="font-bold text-2xl">
                {`Room ${shortenAddress(roomId)}`}
              </h1>
              <RefreshCw
                size={20}
                onClick={refresh}
                className={`ml-4 hover:cursor-pointer ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
              <div className="relative flex justify-center">
                <button
                  onClick={onShareClicked}
                  className="border py-1 px-4 ml-4 rounded-md transition-colors hover:bg-blue-300 disabled:cursor-not-allowed"
                >
                  Share
                </button>
                <span
                  className={`absolute w-32 left-0 top-10 transition-all rounded bg-gray-800 p-2 text-center z-10 text-white ${
                    displayShareSuccess ? "scale-100" : "scale-0"
                  }`}
                >
                  📋 Copied to clipboard!
                </span>
              </div>
            </div>
            {admins.length > 0 && (
              <div className="flex items-center">
                <span className="font-bold mr-1">Admins:</span>
                {admins.map((admin) => shortenAddress(admin)).join(", ")}
                {isAdmin && (
                  <PlusCircle
                    size={20}
                    onClick={() => setIsAddAdminModalOpen(true)}
                    className={`ml-2 text-green-600 hover:cursor-pointer`}
                  />
                )}
              </div>
            )}
          </div>
          <QuestionInput roomId={roomId} />
          {error && <div className="text-center text-red-600">{error}</div>}
          <QuestionList isAdmin={isAdmin} roomId={roomId} address={address!} />
        </div>
        <AddAdminModal
          roomId={roomId}
          isOpen={isAddAdminModalOpen}
          onClose={() => setIsAddAdminModalOpen(false)}
        />
      </main>
    </div>
  );
}
