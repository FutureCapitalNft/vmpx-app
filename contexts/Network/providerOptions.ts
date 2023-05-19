import * as ga from "@/shared/ga";
import getConfig from "next/config";
import networks from "../../config/networks";

const { publicRuntimeConfig } = getConfig();
const currentNetworks = networks({config: publicRuntimeConfig});

export const connector = (name: string) => async (provider: any, options: any) => {
  console.log('connect', name, options)
  if (!provider.selectedAddress) {
    await provider.request({
      method: 'wallet_requestPermissions',
      params: [{eth_accounts: {}}],
    })
    const accounts = await provider.request({method: 'eth_accounts'})
    if (accounts && accounts.length > 0) {
      // dispatch({type: 'accounts', payload: accounts})
      ga.event({
        action: 'authorized_wallet_success',
        params: {
          type: name,
          already_connected: false
        }
      })
    } else {
      ga.event({
        action: 'authorized_wallet_failure',
        params: {
          type: name,
        }
      })
    }
    return window[name as any]; //provider
  } else {
    const accounts = await provider.request({method: 'eth_accounts'})
    if (accounts && accounts.length > 0) {
      ga.event({
        action: 'authorized_wallet_success',
        params: {
          type: name,
          already_connected: false
        }
      })
    } else {
      ga.event({
        action: 'authorized_wallet_failure',
        params: {
          type: name,
        }
      })
    }
    return window[name as any];  //provider
  }
};

export const providerOptions = (typeof window !== 'undefined') && {
  //pollingInterval: publicRuntimeConfig.rpcPollingInterval,
  //walletconnect: {
  //    package: WalletConnectProvider, // required
  //    options: wcProviderOptions
  //},
  'custom-okxwallet': {
    display: {
      logo: `/logos/okx-logo.svg`,
      name: 'OKX Wallet',
      description: 'Connect to your OKX Wallet',
    },
    package: {
      ...window['okxwallet' as any],
      name: 'okxwallet',
      check: 'isOkxWallet'
    },
    connector: connector('okxwallet'),
  },
  'custom-trustwallet': {
    display: {
      name: 'Trust Wallet',
      description: 'Connect to your Trust Wallet',
    },
    package: {
      ...window['trustwallet' as any],
      name: 'trustwallet',
      check: 'isTrustWallet'
    },
    connector: connector('trustwallet'),
  },
  bitkeep: {
    package: true
  },
  /*
  'custom-bitkeep': {
    display: {
      name: 'Bitkeep Wallet',
      description: 'Connect to your Bitkeep Wallet',
    },
    package: {
      ...window['bitkeep']['ethereum'],
      name: 'bitkeep',
      check: 'isBitkeepChrome'
    },
    connector: connector('bitkeep'),
  }
   */
};

export const wcProviderOptions = {
  pollingInterval: publicRuntimeConfig.rpcPollingInterval,
  infuraId: publicRuntimeConfig.infuraId,
  networkId: publicRuntimeConfig.defaultNetworkId,
  // chainId: Number(publicRuntimeConfig),
  rpc: Object.entries(currentNetworks)
    .reduce((res,[k,v]) => {
      res[Number(v.chainId)] = typeof v.rpcURL === 'string' ? v.rpcURL : v.rpcURL?.[0]
      return res
    }, {} as any)
}
