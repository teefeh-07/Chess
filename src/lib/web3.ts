 import { createConfig, http } from 'wagmi'

export const somniaTestnetChain = {
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'SOMI',
    symbol: 'SOMI',
  },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] },
    public: { http: ['https://dream-rpc.somnia.network'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://dream-explorer.somnia.network' },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [somniaTestnetChain],
  transports: {
    [somniaTestnetChain.id]: http('https://dream-rpc.somnia.network'),
  },
})
