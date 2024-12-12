import { create } from 'zustand';
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from '@wagmi/core';
import {
  ROOM_MANAGER_ADDRESS,
  ROOM_MANAGER_ABI,
  ROOM_MANAGER_PAYMASTER_ADDRESS,
} from '../config/contracts';
import type { Address } from 'viem';
import { config } from './useWeb3Store';
import { getGeneralPaymasterInput } from 'viem/zksync';
import { Room } from '../types/room';

interface RoomStore {
  currentRoomId: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  isMember: boolean;
  error: string | null;
  createRoom: (name: string) => Promise<void>;
  setCurrentRoom: (roomId: string) => Promise<void>;
  // fetchRoom: (roomId: string) => Promise<void>;
  checkIsAdmin: (roomId: string, address: string) => Promise<void>;
}

export const useRoomStore = create<RoomStore>((set) => ({
  currentRoomId: null,
  isAdmin: false,
  isLoading: false,
  isMember: false,
  error: null,

  createRoom: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: 'createRoom',
        args: [name],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: '0x' }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted');
      }

      // Get room ID from transaction logs
      if (receipt.logs[2]) {
        console.log(receipt.logs);
        const roomId = receipt.logs[2].topics[1];
        set({ currentRoomId: roomId, isAdmin: true });
      }
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to create room:', error);
      set({ error: 'Failed to create room', isLoading: false });
    }
  },

  setCurrentRoom: async (roomId: string) => {
    set({ currentRoomId: roomId });
  },

  checkIsAdmin: async (roomId: string, address: string) => {
    if (!address || !roomId) return;

    try {
      console.log(`checkin' admin of room ${roomId} for user ${address}`);
      const isAdmin = await readContract(config, {
        address: ROOM_MANAGER_ADDRESS as Address,
        abi: ROOM_MANAGER_ABI,
        functionName: 'isAdmin',
        args: [roomId as `0x${string}`, address as `0x${string}`],
      });

      console.log(!!isAdmin);
      set({ isAdmin: !!isAdmin });
    } catch (error) {
      console.error('Failed to check admin status:', error);
      set({ isAdmin: false });
    }
  },
}));
