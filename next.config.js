const path = require('path');
const projects = require('./config/projectConfig.cjs');

const contractInfo = (projects = {}) => {
  return Object.values(projects).reduce((res, p) => {
    return {
      ...res,
      ...p.contracts.reduce((obj, contract, idx) => {
        const envPrefix = p.envPrefix[idx];
        obj[`${contract}Address`] = (process.env.SUPPORTED_CHAINS || '')
            .split(',').filter(_ => !!_)
            .reduce((params, chain) => {
              const envKey = `${envPrefix}_${chain.toUpperCase().replace(/-/g, '_')}`;
              const envParam = process.env[envKey];
              if (envPrefix && envParam) {
                params[chain] = envParam;
              }
              return params;
            }, {});
        return obj;
      }, {})
    }
  }, {})
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    rpcBTestingRatio: process.env.RPC_B_TESTING_RATIO || 0.5,
    // xenApiUrl: 'https://api.xen.network/v1',
    alerts: {
      5: {}, // new alerts start with this number
    },
    requireTermsSigning: !!process.env.REQUIRE_SIGNING,
    xenftMessage: (process.env.SUPPORTED_CHAINS || '')
        .split(',').filter(_ => !!_)
        .reduce((res, e) => {
          if (process.env[`XENFT_MESSAGE_${e.toUpperCase().replace(/-/g, '_')}`]) {
            res[e] = process.env[`XENFT_MESSAGE_${e.toUpperCase().replace(/-/g, '_')}`];
          }
          return res;
        }, {}),
    maxSafeVMUs: (process.env.SUPPORTED_CHAINS || '')
        .split(',').filter(_ => !!_)
        .reduce((res, e) => {
          if (process.env[`MAX_SAFE_VMUS_${e.toUpperCase().replace(/-/g, '_')}`]) {
            res[e] = process.env[`MAX_SAFE_VMUS_${e.toUpperCase().replace(/-/g, '_')}`];
          }
          return res;
        }, {}),
    providerTimeout: 5_000,
    debug: process.env.DEBUG,
    vmpxABI: require('./public/abi/VMPX.json').abi,
    waitForConfirmationsNumber: 1,
    defaultProvider: process.env.DEFAULT_PROVIDER || false,
    // buyXenLink: process.env.BUY_XEN_LINK || 'https://coinmarketcap.com/currencies/xen-crypto/markets/',
    rpcPollingInterval: parseInt(process.env.RPC_POLLING_INTERVAL) || 30_000,
    walletConnectApiKey: process.env.NEXT_PUBLIC_WALLETCONNECT_KEY,
    walletConnectVersion: process.env.WALLETCONNECT_VERSION,
    nodeEnv: process.env.NODE_ENV,
    infuraId: process.env.INFURA_KEY || process.env.NEXT_PUBLIC_INFURA_KEY,
    alchemyId: process.env.ALCHEMY_KEY,
    quickNodeId: process.env.QUICKNODE_KEY,
    defaultNetworkId: process.env.ETH_NETWORK_ID,
    wsUrl: process.env.WS_URL,
    rpcUrl: process.env.RPC_URL,
    xenVersion: process.env.XEN_VERSION || '1',
    deployedUrl: process.env.NEXT_PUBLIC_VERCEL_URL || 'https://getvmpx.com',
    isTestnet: process.env.IS_TESTNET,
    supportedChains: (process.env.SUPPORTED_CHAINS || '')
        .split(',').filter(_ => !!_),
    wsUrlOverrides: (process.env.SUPPORTED_CHAINS || '')
        .split(',').filter(_ => !!_)
        .reduce((res, e) => {
          if (process.env[`WS_URL_${e.toUpperCase().replace(/-/g, '_')}`]) {
            res[e] = process.env[`WS_URL_${e.toUpperCase().replace(/-/g, '_')}`];
          }
          return res;
        }, {}),
    rpcUrlOverrides: (process.env.SUPPORTED_CHAINS || '')
        .split(',').filter(_ => !!_)
        .reduce((res, e) => {
          if (process.env[`RPC_URL_${e.toUpperCase().replace(/-/g, '_')}`]) {
            res[e] = process.env[`RPC_URL_${e.toUpperCase().replace(/-/g, '_')}`];
          }
          return res;
        }, {}),
    rpcUrlOverridesBTest: (process.env.SUPPORTED_CHAINS || '')
        .split(',').filter(_ => !!_)
        .reduce((res, e) => {
          if (process.env[`RPC_URL_B_${e.toUpperCase().replace(/-/g, '_')}`]) {
            res[e] = process.env[`RPC_URL_B_${e.toUpperCase().replace(/-/g, '_')}`];
          }
          return res;
        }, {}),
    wsUrlOverridesBTest: (process.env.SUPPORTED_CHAINS || '')
        .split(',').filter(_ => !!_)
        .reduce((res, e) => {
          if (process.env[`WS_URL_B_${e.toUpperCase().replace(/-/g, '_')}`]) {
            res[e] = process.env[`WS_URL_B_${e.toUpperCase().replace(/-/g, '_')}`];
          }
          return res;
        }, {}),
    // apiBaseUrl: process.env.API_BASE_URL || 'https://api.xen.network/v1',
    ...contractInfo(projects)
  },
  reactStrictMode: true,
  swcMinify: false,
  output: 'standalone',
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
  async redirects() {
    return [
      {
        source: '/terms.html',
        destination: `/terms`,
        permanent: true
      },
    ]
  },

}

module.exports = nextConfig;
