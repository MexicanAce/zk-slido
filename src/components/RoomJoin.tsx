import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function RoomJoin() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId) {
      navigate(`/${roomId}`);
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-4">
      <h2 className="text-2xl font-semibold">Join a Q&A Room</h2>
      <div>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Join Room
      </button>
    </form>
  );
}