import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { QuestionInput } from '../components/QuestionInput';
import { QuestionList } from '../components/QuestionList';
import { LoginModal } from '../components/LoginModal';
import { Header } from '../components/layout/Header';
import { useWeb3Store } from '../store/useWeb3Store';
import { useRoomStore } from '../store/useRoomStore';
import { useRoomAdmin } from '../hooks/useRoomAdmin';
import { useRoomSetup } from '../hooks/useRoomSetup';
import { useQuestions } from '../hooks/useQuestions';
import { RefreshCw } from 'lucide-react';

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { address, connect } = useWeb3Store();
  const { isAdmin, checkIsAdmin } = useRoomStore();
  const { isLoading, error, refresh } = useQuestions(roomId);

  useRoomSetup(roomId);
  useRoomAdmin(roomId);

  if (!roomId) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    checkIsAdmin(roomId, address!);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Q&A Room" onLoginClick={() => connect()} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center">
            <h1 className="font-bold text-2xl">
              {`Room ${
                roomId.slice(0, 5) +
                '...' +
                roomId.slice(roomId.length - 6, roomId.length)
              }`}
            </h1>
            <RefreshCw
              size={20}
              onClick={refresh}
              className={`ml-4 hover:cursor-pointer ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
          </div>
          <QuestionInput roomId={roomId} />
          {error && <div className="text-center text-red-600">{error}</div>}
          <QuestionList isAdmin={isAdmin} roomId={roomId} />
        </div>
      </main>
    </div>
  );
}
