import React from 'react';
import { useRoomStore } from '../store/useRoomStore';

export function RoomCreation() {
  const { createRoom } = useRoomStore();

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Create a New Q&A Room</h2>
      <button
        onClick={createRoom}
        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Create Room
      </button>
    </div>
  );
}