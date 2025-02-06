import { create } from "zustand";
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import {
  ROOM_MANAGER_ADDRESS,
  ROOM_MANAGER_ABI,
  ROOM_MANAGER_PAYMASTER_ADDRESS,
} from "../config/contracts";
import { ContractFunctionExecutionError, type Address } from "viem";
import { config, isSessionInvalid } from "./useWeb3Store";
import { getGeneralPaymasterInput } from "viem/zksync";

interface RoomStore {
  currentRoomId: string | null;
  currentRoomName: string;
  admins: string[];
  isAdmin: boolean;
  isLoading: boolean;
  isMember: boolean;
  error: string | null;
  createRoom: (name: string) => Promise<void>;
  setCurrentRoom: (roomId: string) => Promise<void>;
  checkIsAdmin: (roomId: string, address: string) => Promise<void>;
  addAdmin: (roomId: string, address: string) => Promise<void>;
  updateRoomName: (roomId: string, name: string) => Promise<void>;
}

export const useRoomStore = create<RoomStore>((set) => ({
  currentRoomId: null,
  currentRoomName: "",
  admins: [],
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
        functionName: "createRoom",
        args: [name],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: "0x" }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      // Get room ID from transaction logs
      if (receipt.logs[2]) {
        console.log(receipt.logs);
        const roomId = receipt.logs[2].topics[1];
        set({ currentRoomId: roomId, isAdmin: true, currentRoomName: name });
      }
      set({ isLoading: false });
    } catch (error) {
      console.error("Failed to create room:", error);
      let displayError = "Failed to create room";
      if (
        error instanceof ContractFunctionExecutionError &&
        isSessionInvalid(error.cause.shortMessage)
      ) {
        displayError += " due to invalid session";
      }
      set({ error: displayError, isLoading: false });
    }
  },

  setCurrentRoom: async (roomId: string) => {
    const room = await readContract(config, {
      address: ROOM_MANAGER_ADDRESS as Address,
      abi: ROOM_MANAGER_ABI,
      functionName: "getRoom",
      args: [roomId as `0x${string}`],
    });

    set({ currentRoomId: roomId, currentRoomName: room.name });
  },

  checkIsAdmin: async (roomId: string, address: string) => {
    if (!address || !roomId) return;

    try {
      const room = await readContract(config, {
        address: ROOM_MANAGER_ADDRESS as Address,
        abi: ROOM_MANAGER_ABI,
        functionName: "getRoom",
        args: [roomId as `0x${string}`],
      });

      const isAdmin = room.admins.includes(address as `0x${string}`);

      set({ isAdmin: isAdmin, admins: room.admins as `0x${string}`[] });
    } catch (error) {
      console.error("Failed to check admin status:", error);
      set({ isAdmin: false, admins: [] });
    }
  },

  updateRoomName: async (roomId: string, name: string) => {
    if (!name || !roomId) return;

    set({ isLoading: true, error: null });
    try {
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "updateRoomName",
        args: [roomId as `0x${string}`, name],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: "0x" }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      const room = await readContract(config, {
        address: ROOM_MANAGER_ADDRESS as Address,
        abi: ROOM_MANAGER_ABI,
        functionName: "getRoom",
        args: [roomId as `0x${string}`],
      });

      set({
        currentRoomName: room.name,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to update room name:", error);
      let displayError = "Failed to update room name";
      if (
        error instanceof ContractFunctionExecutionError &&
        isSessionInvalid(error.cause.shortMessage)
      ) {
        displayError += " due to invalid session";
      }
      set({ isLoading: false, error: displayError });
    }
  },

  addAdmin: async (roomId: string, address: string) => {
    if (!address || !roomId) return;

    set({ isLoading: true, error: null });
    try {
      const hash = await writeContract(config, {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "addAdmin",
        args: [roomId as `0x${string}`, address as `0x${string}`],
        paymaster: ROOM_MANAGER_PAYMASTER_ADDRESS,
        paymasterInput: getGeneralPaymasterInput({ innerInput: "0x" }),
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      const room = await readContract(config, {
        address: ROOM_MANAGER_ADDRESS as Address,
        abi: ROOM_MANAGER_ABI,
        functionName: "getRoom",
        args: [roomId as `0x${string}`],
      });

      console.log(room);

      const isAdmin = room.admins.includes(address as `0x${string}`);

      set({
        isAdmin: isAdmin,
        admins: room.admins as `0x${string}`[],
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to add Admin:", error);
      let displayError = "Failed to add Admin";
      if (
        error instanceof ContractFunctionExecutionError &&
        isSessionInvalid(error.cause.shortMessage)
      ) {
        displayError += " due to invalid session";
      }
      set({
        isAdmin: false,
        admins: [],
        isLoading: false,
        error: displayError,
      });
    }
  },
}));
