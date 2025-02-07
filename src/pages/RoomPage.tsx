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
import { PencilIcon, PlusCircle, RefreshCw, SaveIcon } from "lucide-react";
import { shortenAddress } from "../utils/misc";
import { AddAdminModal } from "../components/AddAdminModal";
import { MorphingGradientBackground } from "../components/MorphingGradientBackground";
import { cn } from "../utils/cn";

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { address, connect } = useWeb3Store();
  const {
    admins,
    isAdmin,
    currentRoomName,
    checkIsAdmin,
    updateRoomName,
    isLoading: isRoomLoading,
  } = useRoomStore();
  const { isLoading, error, refresh } = useQuestions(roomId);
  useRoomSetup(roomId);
  useRoomAdmin(roomId);

  const [displayShareSuccess, setDisplayShareSuccess] = useState(false);
  const [displayEditNameInput, setDisplayEditNameInput] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

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

  async function onSaveNewRoomName() {
    if (isLoading) return;

    if (currentRoomName !== newRoomName) {
      await updateRoomName(roomId!, newRoomName);
    }
    setDisplayEditNameInput(false);
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Q&A Platform"
        onLoginClick={async () => {
          await connect();
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3 text-slate-50">
            <div className="flex items-center">
              {displayEditNameInput && (
                <input
                  type="text"
                  name="roomName"
                  minLength={6}
                  maxLength={60}
                  className="bg-transparent text-slate-50 text-2xl font-bold caret-slate-50 border rounded-md px-1 py-0.5 focus:outline-none invalid:border-red-400"
                  value={newRoomName}
                  disabled={isRoomLoading}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
              )}
              {!displayEditNameInput && (
                <h1 className="font-bold text-2xl">{currentRoomName}</h1>
              )}
              {isAdmin && !displayEditNameInput && (
                <PencilIcon
                  size={20}
                  onClick={() => {
                    setNewRoomName(currentRoomName);
                    setDisplayEditNameInput((x) => !x);
                  }}
                  className="ml-4 hover:cursor-pointer"
                />
              )}
              {isAdmin && displayEditNameInput && (
                <SaveIcon
                  size={20}
                  onClick={onSaveNewRoomName}
                  className={cn(
                    "ml-4 hover:cursor-pointer",
                    isRoomLoading && "hover:cursor-not-allowed text-gray-500"
                  )}
                />
              )}
              <RefreshCw
                size={20}
                onClick={refresh}
                className={cn(
                  "ml-4 hover:cursor-pointer",
                  isLoading && "animate-spin"
                )}
              />
              <div className="relative flex justify-center">
                <button
                  onClick={onShareClicked}
                  className="border py-1 px-4 ml-4 rounded-md transition-colors hover:bg-blue-600 disabled:cursor-not-allowed"
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
                    className={`ml-2 text-green-400 hover:cursor-pointer`}
                  />
                )}
              </div>
            )}
          </div>
          <QuestionInput roomId={roomId} />
          {error && (
            <div className="text-center text-red-600">
              {error}
              {error?.endsWith("invalid session") && (
                <span className="ml-1.5 italic">
                  (Please disconnect & login)
                </span>
              )}
              {/* {error?.endsWith("invalid session") && (
                <button
                  onClick={onRefreshClicked}
                  className="border py-1 px-4 ml-1.5 rounded-md transition-colors text-slate-600 hover:bg-blue-300 disabled:cursor-not-allowed"
                >
                  Refresh Session?
                </button>
              )} */}
            </div>
          )}
          <QuestionList isAdmin={isAdmin} roomId={roomId} address={address!} />
        </div>
        <AddAdminModal
          roomId={roomId}
          isOpen={isAddAdminModalOpen}
          onClose={() => setIsAddAdminModalOpen(false)}
        />
      </main>
      <MorphingGradientBackground />
    </div>
  );
}
