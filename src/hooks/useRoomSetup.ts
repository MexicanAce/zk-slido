import { useEffect } from 'react';
import { useRoomStore } from '../store/useRoomStore';

export function useRoomSetup(roomId: string | undefined) {
  const { setCurrentRoom } = useRoomStore();

  useEffect(() => {
    if (!roomId) return;
    setCurrentRoom(roomId);
  }, [roomId, setCurrentRoom]);
}