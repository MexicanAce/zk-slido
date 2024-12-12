import { createConfig, http } from '@wagmi/core';
import { zksyncSepoliaTestnet } from 'viem/chains';
import { zksyncSsoConnector } from 'zksync-sso/connector';
import { parseEther } from 'viem';
import {
  ROOM_MANAGER_ADDRESS,
  ROOM_MANAGER_ABI,
  QUESTION_MANAGER_ABI,
} from './contracts';

export const connector = zksyncSsoConnector({
  metadata: {
    icon: '/vite.svg',
  },
  authServerUrl: 'https://sso.zksync.io',
  session: {
    feeLimit: parseEther('0.001'),
    contractCalls: [
      {
        address: ROOM_MANAGER_ADDRESS,
        abi: ROOM_MANAGER_ABI,
      },
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
