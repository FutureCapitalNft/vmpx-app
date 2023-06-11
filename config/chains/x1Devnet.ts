import { Chain } from 'wagmi'

export const x1Devnet = {
  id: Number(0x315e4),
  name: 'X1 Devnet',
  network: 'x1',
  nativeCurrency: {
    decimals: 18,
    name: 'XN',
    symbol: 'XN',
  },
  rpcUrls: {
    public: { http: ['https://x1-devnet.xen.network'] },
    default: { http: ['https://x1-devnet.xen.network'] },
  },
  blockExplorers: {
    etherscan: { name: 'X1 Devnet Explorer', url: 'https://explorer.x1-devnet.xen.network/' },
    default: { name: 'X1 Devnet Explore', url: 'https://explorer.x1-devnet.xen.network/' },
  },
  contracts: {
    multicall3: {
      address: '0xDfD254a6a32a30924A88E6d9E39bB209C0b75cAC',
      blockCreated: 5_306_514,
    },
  },
} as const satisfies Chain
