import {NextConfig} from "next";

const arrayOrString = (something: any): string | string[] | null => {
  if (!something) return null;
  return something.split(',').length > 1 ? something.split(',').filter((e: string) => !!e) : something
}

export type TNetworkConfig = {
  isTestnet: boolean;
  chainId: string | number;
  networkId: string;
  gasLimit?: number | null;
  name: string;
  icon?: any;
  currencyUnit?: string | null;
  decimals?: number | null;
  wsURL: string | string[] | null;
  rpcURL: string | string[] | null;
  eventsUrl?: string | null;
  explorerUrl?: string | null;
  logoUrl?: string | Record<string, string> | null;
  contractAddress: string | number | null;
  vmpxMessage?: string | null;
  maxSafeVMUs?: string;
}

const addresses = (config: NextConfig, networkId: string) => ({
  contractAddress: config.contractAddress[networkId],
})

const networkConfigs = ({config}: any): Record<string, TNetworkConfig> => ({

  // MAINNETS
  mainnet: {
    isTestnet: false,
    chainId: '0x1',
    networkId: 'mainnet',
    name: 'Ethereum',
    currencyUnit: 'ETH',
    gasLimit: 30_000_000,
    wsURL: arrayOrString(config.wsUrlOverrides['mainnet'])
      || `wss://mainnet.infura.io/ws/v3/${config.infuraId}`,
    rpcURL: arrayOrString(config.rpcUrlOverrides['mainnet'])
      || `https://mainnet.infura.io/v3/${config.infuraId}`,
    explorerUrl: 'https://etherscan.io/',
    logoUrl: '/logos/ethereum-logo.png',
    vmpxMessage: config.xenftMessage['mainnet'],
    maxSafeVMUs: config.maxSafeVMUs['mainnet'],
    ...addresses(config, 'mainnet'),
  },

  // TESTNETS
  goerli: {
    isTestnet: false,
    gasLimit: 30_000_000,
    chainId: '0x5',
    networkId: 'goerli',
    name: 'Goerli Testnet',
    currencyUnit: 'ETH',
    wsURL: arrayOrString(config.wsUrlOverrides['goerli'])
      || `wss://goerli.fc-internal.com`,
    rpcURL: arrayOrString(config.rpcUrlOverrides['goerli'])
      || `https://goerli.fc-internal.com`,
    explorerUrl: 'https://goerli.etherscan.io/',
    logoUrl: '/logos/ethereum-logo.png',
    vmpxMessage: config.xenftMessage['goerli'],
    maxSafeVMUs: config.maxSafeVMUs['goerli'],
    ...addresses(config, 'goerli'),
  },

  // devnet
  x1: {
    isTestnet: false,
    gasLimit: 30_000_000,
    chainId: '0x315e4',
    networkId: 'x1',
    name: 'X1 Devnet',
    currencyUnit: 'XN',
    wsURL: arrayOrString(config.wsUrlOverrides['x1'])
      || `wss://x1-devnet.xen.network/ws`,
    rpcURL: arrayOrString(config.rpcUrlOverrides['x1'])
      || `https://x1-devnet.xen.network`,
    explorerUrl: 'https://explorer.x1-devnet.xen.network/',
    logoUrl: '/XEN-logo-square-light 512x512.png',
    vmpxMessage: config.xenftMessage['x1'],
    maxSafeVMUs: config.maxSafeVMUs['x1'],
    ...addresses(config, 'x1'),
  },
})

const networks = ({config}: any): Record<string, TNetworkConfig> => Object.entries(networkConfigs({config}))
  .reduce((res, [k,v]) => {
    if (v.isTestnet === !!config.isTestnet &&
      config.supportedChains.includes(v.networkId)) {
      res[k] = v;
    }
    return res;
  }, {} as any)


export default networks;
