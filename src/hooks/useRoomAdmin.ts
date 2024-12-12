import { useEffect } from 'react';
import { useWeb3Store } from '../store/useWeb3Store';
import { useRoomStore } from '../store/useRoomStore';

export function useRoomAdmin(roomId: string | undefined) {
  const { address } = useWeb3Store();
  const { checkIsAdmin } = useRoomStore();

  useEffect(() => {
    if (address && roomId) {
      checkIsAdmin(address);
    }
  }, [address, roomId, checkIsAdmin]);
}