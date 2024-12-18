import { create } from "zustand";
import {
  connect,
  createConfig,
  disconnect,
  getAccount,
  http,
  reconnect,
  watchAccount,
} from "@wagmi/core";
import { zksyncSepoliaTestnet } from "viem/chains";
import { callPolicy, zksyncSsoConnector } from "zksync-sso/connector";
import { parseEther } from "viem";
import { ROOM_MANAGER_ADDRESS, ROOM_MANAGER_ABI } from "../config/contracts";

interface Web3Store {
  isConnected: boolean;
  address: string | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const SSO_INVALID_SESSION_ERRORS = [
  "block.timestamp is too close to the range end",
  "Allowance limit exceeded",
  "function_selector = 0x3d5740d9", // Unsure wtf this is
];

export const isSessionInvalid = (errorMessage: string): boolean => {
  return (
    SSO_INVALID_SESSION_ERRORS.find((x) => errorMessage.includes(x)) !=
    undefined
  );
}

const connector = zksyncSsoConnector({
  metadata: {
    icon: "https://www.svgrepo.com/show/347317/question-answer.svg",
  },
  session: {
    expiry: "30 days",
    feeLimit: {
      limit: parseEther("0.001"),
      limitType: "lifetime",
    },
    contractCalls: [
      callPolicy({
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "createRoom",
      }),
      callPolicy({
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "addAdmin",
      }),
      callPolicy({
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "addQuestion",
      }),
      callPolicy({
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "voteQuestion",
      }),
      callPolicy({
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "editQuestion",
      }),
      callPolicy({
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "deleteQuestion",
      }),
      callPolicy({
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
        functionName: "toggleQuestionStatus",
      }),
    ],
  },
});

export const config = createConfig({
  chains: [zksyncSepoliaTestnet],
  connectors: [connector],
  transports: {
    [zksyncSepoliaTestnet.id]: http(),
  },
});

reconnect(config);

export const useWeb3Store = create<Web3Store>((set) => {
  const account = getAccount(config);

  watchAccount(config, {
    onChange: (account) => {
      set({
        isConnected: account.isConnected,
        address: account.address,
      });
    },
  });

  return {
    isConnected: account.isConnected,
    address: account.address,
    connect: async () => {
      try {
        await connect(config, {
          connector,
          chainId: zksyncSepoliaTestnet.id,
        });
      } catch (error) {
        console.error("Failed to connect:", error);
      }
    },
    disconnect: () => {
      disconnect(config);
    },
  };
});
