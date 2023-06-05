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
    ...addresses(config, 'mainnet'),
  },
  bsc: {
    isTestnet: false,
    chainId: '0x' + (56).toString(16),
    networkId: 'bsc',
    currencyUnit: 'BNB',
    gasLimit: 130_000_000,
    name: 'BSC',
    wsURL: arrayOrString(config.wsUrlOverrides['bsc'])
      || `wss://bsc.fc-internal.com`,
    rpcURL: arrayOrString(config.rpcUrlOverrides['bsc'])
      || `https://bsc.fc-internal.com`,
    explorerUrl: 'https://bscscan.com/',
    logoUrl: '/logos/bsc-logo.svg',
    vmpxMessage: config.xenftMessage['bsc'],
    ...addresses(config, 'bsc'),
  },
  polygon: {
    isTestnet: false,
    chainId: '0x' + (137).toString(16),
    networkId: 'polygon',
    currencyUnit: 'MATIC',
    gasLimit: 29_000_000,
    name: 'Polygon',
    wsURL: arrayOrString(config.wsUrlOverrides['polygon'])
      || null,
    rpcURL: arrayOrString(config.rpcUrlOverrides['polygon'])
      || `https://polygon-mainnet.infura.io/v3/3d2cd93811864ff0ad6e9b2efed40416`,
    explorerUrl: 'https://polygonscan.com/',
    logoUrl: '/logos/polygon-logo.png',
    vmpxMessage: config.xenftMessage['polygon'],
    ...addresses(config, 'polygon'),
  },
  avalanche: {
    isTestnet: false,
    chainId: '0x' + (43114).toString(16),
    networkId: 'avalanche',
    currencyUnit: 'AVAX',
    name: 'Avalanche C',
    gasLimit: 15_000_000,
    wsURL: arrayOrString(config.wsUrlOverrides['avalanche'])
      || null,
    rpcURL: arrayOrString(config.rpcUrlOverrides['avalanche'])
      || `https://avalanche-mainnet.infura.io/v3/${config.infuraId}`,
    explorerUrl: 'https://snowtrace.io/',
    logoUrl: '/logos/avalanche-logo.png',
    vmpxMessage: config.xenftMessage['avalanche'],
    ...addresses(config, 'polygon'),
  },
  ethpow: {
    isTestnet: false,
    chainId: '0x' + (10001).toString(16),
    networkId: 'ethpow',
    gasLimit: 30_000_000,
    currencyUnit: 'ETHW',
    name: 'Ethereum PoW',
    wsURL: arrayOrString(config.wsUrlOverrides['ethpow'])
      || null,
    rpcURL: arrayOrString(config.rpcUrlOverrides['ethpow'])
      || `https://mainnet.ethereumpow.org`,
    explorerUrl: 'https://www.oklink.com/en/ethw/',
    logoUrl: '/logos/ethpow-logo.png',
    vmpxMessage: config.xenftMessage['ethpow'],
    ...addresses(config, 'ethpow'),
  },
  moonbeam: {
    isTestnet: false,
    chainId: '0x' + (1284).toString(16),
    networkId: 'moonbeam',
    currencyUnit: 'GLMR',
    name: 'Moonbeam',
    gasLimit: 12_900_000,
    wsURL: arrayOrString(config.wsUrlOverrides['moonbeam'])
      || 'wss://moonbeam.public.blastapi.io',
    rpcURL: arrayOrString(config.rpcUrlOverrides['moonbeam'])
      || `https://rpc.ankr.com/moonbeam`,
    explorerUrl: 'https://moonbeam.moonscan.io/',
    logoUrl: '/logos/moonbeam-logo.png',
    vmpxMessage: config.xenftMessage['moonbeam'],
    ...addresses(config, 'moonbeam'),
  },
  evmos: {
    isTestnet: false,
    chainId: '0x' + (9001).toString(16),
    networkId: 'evmos',
    currencyUnit: 'EVMOS',
    name: 'Evmos',
    gasLimit: 40_000_000,
    wsURL: arrayOrString(config.wsUrlOverrides['evmos'])
      || null,
    rpcURL: arrayOrString(config.rpcUrlOverrides['evmos'])
      || `https://evmos-evm.publicnode.com`,
    explorerUrl: 'https://evm.evmos.org/',
    logoUrl: '/logos/evmos-logo.png',
    vmpxMessage: config.xenftMessage['evmos'],
    ...addresses(config, 'evmos'),
  },
  fantom: {
    isTestnet: false,
    chainId: '0x' + (250).toString(16),
    networkId: 'fantom',
    currencyUnit: 'FTM',
    name: 'Fantom',
    gasLimit: 10_000_000,
    wsURL: arrayOrString(config.wsUrlOverrides['fantom'])
      || null,
    rpcURL: arrayOrString(config.rpcUrlOverrides['fantom'])
      || `https://rpc.ankr.com/fantom/`,
    explorerUrl: 'https://ftmscan.com/',
    logoUrl: '/logos/fantom-logo.svg',
    vmpxMessage: config.xenftMessage['fantom'],
    ...addresses(config, 'fantom'),
  },
  dogechain: {
    isTestnet: false,
    chainId: '0x' + (2000).toString(16),
    networkId: 'dogechain',
    currencyUnit: 'DOGE',
    name: 'Dogechain',
    wsURL: arrayOrString(config.wsUrlOverrides['dogechain'])
      || null,
    rpcURL: arrayOrString(config.rpcUrlOverrides['dogechain'])
      || `https://rpc.dogechain.dog`,
    explorerUrl: 'https://explorer.dogechain.dog/',
    logoUrl: '/logos/dogechain-logo.png',
    vmpxMessage: config.xenftMessage['dogechain'],
    ...addresses(config, 'polygon'),
  },
  okxchain: {
    isTestnet: false,
    chainId: '0x' + (66).toString(16),
    networkId: 'okxchain',
    currencyUnit: 'OKT',
    name: 'OKC (OKX Chain)',
    gasLimit: 50_000_000,
    wsURL: arrayOrString(config.wsUrlOverrides['okxchain'])
      || null,
    rpcURL: arrayOrString(config.rpcUrlOverrides['okxchain'])
      || `https://exchainrpc.okex.org`,
    eventsUrl: null,
    explorerUrl: 'https://www.oklink.com/en/okc/',
    logoUrl: '/logos/okx-logo.svg',
    vmpxMessage: config.xenftMessage['okxchain'],
    ...addresses(config, 'okxchain'),
  },
  'pulse-chain': {
    isTestnet: false,
    chainId: '0x171',
    networkId: 'pulse-chain',
    currencyUnit: 'PLS',
    name: 'PulseChain',
    gasLimit: 30_000_000,
    wsURL: arrayOrString(config.wsUrlOverrides['pulse-chain']),
    rpcURL: arrayOrString(config.rpcUrlOverrides['pulse-chain'])
      || 'https://rpc.pulsechain.com',
    explorerUrl: 'https://scan.pulsechain.com/',
    logoUrl: '/logos/pulse-chain-logo.png',
    vmpxMessage: config.xenftMessage['pulse-chain'],
    ...addresses(config, 'pulse-chain'),
  },
  optimism: {
    isTestnet: false,
    chainId: '0xa',
    networkId: 'optimism',
    currencyUnit: 'ETH',
    name: 'Optimism',
    gasLimit: 30_000_000,
    wsURL: arrayOrString(config.wsUrlOverrides['optimism']),
    rpcURL: arrayOrString(config.rpcUrlOverrides['optimism'])
      || 'https://optimism-mainnet.infura.io/v3/3e8615a3d89b49f381108b46b52f9712',
    explorerUrl: 'https://optimistic.etherscan.io/',
    logoUrl: '/logos/optimism-logo.png',
    vmpxMessage: config.xenftMessage['optimism'],
    ...addresses(config, 'optimism'),
  },

  // TESTNETS
  // TODO: comment this section before deploying !!!
  ganache: {
    isTestnet: true,
    chainId: '0x' + (222222222).toString(16),
    networkId: 'ganache',
    name: 'Ganache',
    wsURL: arrayOrString(config.wsUrlOverrides['ganache'] )
      || `ws://localhost:8545`,
    rpcURL: arrayOrString(config.rpcUrlOverrides['ganache'])
      || `http://localhost:8545`,
    explorerUrl: '',
    logoUrl: '',
    ...addresses(config, 'ganache'),
  },
  goerli: {
    isTestnet: true,
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
    ...addresses(config, 'goerli'),
  },
  'bsc-testnet': {
    isTestnet: true,
    chainId: '0x61',
    networkId: 'bsc-testnet',
    name: 'BSC Testnet',
    wsURL: arrayOrString(config.wsUrlOverrides['bsc-testnet']),
    rpcURL: arrayOrString(config.rpcUrlOverrides['bsc-testnet'])
      || 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorerUrl: 'https://testnet.bscscan.com/',
    logoUrl: '',
    vmpxMessage: config.xenftMessage['bsc-testnet'],
    ...addresses(config, 'bsc-testnet'),
  },
  'pulse-testnet': {
    isTestnet: true,
    chainId: '0x171',
    networkId: 'pulse-testnet',
    currencyUnit: 'PLS',
    name: 'PulseChain X',
    gasLimit: 30_000_000,
    wsURL: arrayOrString(config.wsUrlOverrides['pulse-testnet']),
    rpcURL: arrayOrString(config.rpcUrlOverrides['pulse-testnet'])
      || 'https://rpc.pulsechain.com',
    explorerUrl: 'https://scan.pulsechain.com/',
    logoUrl: '/logos/pulse-chain-logo.png',
    vmpxMessage: config.xenftMessage['pulse-testnet'],
    ...addresses(config, 'pulse-testnet'),
  },
  'mumbai': {
    isTestnet: true,
    gasLimit: 20_000_000,
    chainId: '0x13881',
    networkId: 'mumbai',
    name: 'Mumbai Testnet',
    currencyUnit: 'MATIC',
    wsURL: arrayOrString(config.wsUrlOverrides['mumbai'])
      // || 'wss://mumbai.fc-internal.com'
    ,
    rpcURL: arrayOrString(config.rpcUrlOverrides['mumbai'])
      // || 'https://mumbai.fc-internal.com'
    ,
    explorerUrl: 'https://mumbai.polygonscan.com/',
    logoUrl: '/logos/polygon-logo.png',
    vmpxMessage: config.xenftMessage['mumbai'],
    ...addresses(config, 'mumbai'),
  },
  'moonbase': {
    isTestnet: true,
    chainId: '0x' + (1287).toString(16),
    networkId: 'moonbase',
    name: 'Moonbase Alpha',
    currencyUnit: 'DEV',
    wsURL: arrayOrString(config.wsUrlOverrides['moonbase'])
      || 'wss://wss.api.moonbase.moonbeam.network',
    rpcURL: arrayOrString(config.rpcUrlOverrides['moonbase'])
      || 'https://rpc.api.moonbase.moonbeam.network',
    explorerUrl: 'https://moonbase.moonscan.io/',
    logoUrl: '',
    vmpxMessage: config.xenftMessage['moonbase'],
    ...addresses(config, 'moonbase'),
  },
  'evmos-testnet': {
    isTestnet: true,
    chainId: '0x' + (9000).toString(16),
    networkId: 'evmos-testnet',
    name: 'Evmos Testnet',
    currencyUnit: 'PHOTON',
    wsURL: arrayOrString(config.wsUrlOverrides['evmos-testnet'])
      || '',
    rpcURL: arrayOrString(config.rpcUrlOverrides['evmos-testnet'])
      || 'https://jsonrpc-t.evmos.nodestake.top',
    explorerUrl: 'https://testnet.mintscan.io/evmos-testnet/',
    logoUrl: '/logos/evmos-logo.png',
    vmpxMessage: config.xenftMessage['evmos-testnet'],
    ...addresses(config, 'evmos-testnet'),
  },
  'fantom-testnet': {
    isTestnet: true,
    chainId: '0x' + (4002).toString(16),
    networkId: 'fantom-testnet',
    name: 'Fantom Testnet',
    gasLimit: 10_000_000,
    currencyUnit: 'FTM',
    wsURL: arrayOrString(config.wsUrlOverrides['fantom-testnet'])
      || '',
    rpcURL: arrayOrString(config.rpcUrlOverrides['fantom-testnet'])
      || 'https://rpc.ankr.com/fantom_testnet',
    explorerUrl: 'https://testnet.ftmscan.com/',
    logoUrl: '/logos/fantom-logo.svg',
    vmpxMessage: config.xenftMessage['fantom-testnet'],
    ...addresses(config, 'fantom-testnet'),
  },
  'avalanche-testnet': {
    isTestnet: true,
    chainId: '0x' + (43113).toString(16),
    networkId: 'avalanche-testnet',
    name: 'Avalanche Fuji Testnet',
    gasLimit: 8_000_000,
    currencyUnit: 'AVAX',
    wsURL: arrayOrString(config.wsUrlOverrides['avalanche-testnet'])
      || '',
    rpcURL: arrayOrString(config.rpcUrlOverrides['avalanche-testnet'])
      || 'https://rpc.ankr.com/avalanche_fuji',
    explorerUrl: 'https://testnet.snowtrace.io/',
    logoUrl: '/logos/avalanche-logo.png',
    vmpxMessage: config.xenftMessage['avalanche-testnet'],
    ...addresses(config, 'avalanche-testnet'),
  },
  optimism_goerli: {
    isTestnet: true,
    chainId: '0x1a4',
    networkId: 'optimism_goerli',
    currencyUnit: 'ETH',
    name: 'Optimism Goerli',
    gasLimit: 30_000_000,
    wsURL: arrayOrString(config.wsUrlOverrides['optimism_goerli']),
    rpcURL: arrayOrString(config.rpcUrlOverrides['optimism_goerli'])
      || 'https://optimism-goerli.infura.io/v3/3e8615a3d89b49f381108b46b52f9712',
    explorerUrl: 'https://goerli-optimism.etherscan.io/',
    logoUrl: '/logos/optimism-logo.png',
    vmpxMessage: config.xenftMessage['optimism_goerli'],
    ...addresses(config, 'optimism_goerli'),
  },
  arbitrum_goerli: {
    isTestnet: true,
    chainId: '0x66eed',
    networkId: 'arbitrum_goerli',
    currencyUnit: 'AGOR',
    name: 'Arbitrum Goerli',
    gasLimit: 30_000_000,
    wsURL: arrayOrString(config.wsUrlOverrides['arbitrum_goerli']),
    rpcURL: arrayOrString(config.rpcUrlOverrides['arbitrum_goerli'])
      || 'https://arbitrum-goerli.infura.io/v3/0c4485eb5a0f416d9beb05cd14efd01a',
    explorerUrl: 'https://goerli.arbiscan.io/',
    logoUrl: '/logos/arbitrum-logo.png',
    vmpxMessage: config.xenftMessage['arbitrum_goerli'],
    ...addresses(config, 'arbitrum_goerli'),
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
    ...addresses(config, 'x1'),
  },
  baby_x1: {
    isTestnet: true,
    gasLimit: 30_000_000,
    chainId: '0x315e4',
    networkId: 'baby_x1',
    name: 'X1 Devnet',
    currencyUnit: 'XN',
    wsURL: arrayOrString(config.wsUrlOverrides['baby_x1'])
      || `wss://x1-devnet.xen.network/ws`,
    rpcURL: arrayOrString(config.rpcUrlOverrides['baby_x1'])
      || `https://x1-devnet.xen.network`,
    explorerUrl: 'https://explorer.x1-devnet.xen.network/',
    logoUrl: '/XEN-logo-square-light 512x512.png',
    vmpxMessage: config.xenftMessage['baby_x1'],
    ...addresses(config, 'baby_x1'),

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
