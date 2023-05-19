import * as ga from "@/shared/ga";
import {Web3Provider} from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import {checkForKnownProviders} from "../Network/knownProviders";
import { wcProviderOptions} from "../Network/providerOptions";
import getConfig from "next/config";
import networks from "../../config/networks";
import WalletConnect from "@walletconnect/client";
import Core from "web3modal";

const {publicRuntimeConfig} = getConfig();
const currentNetworks = networks({config: publicRuntimeConfig});

const waitForWcSessionUpdate = (connector: WalletConnect) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('timeout')), 30_000)
    connector.on('session_update', resolve)
    connector.on('error', reject)
  })
}

const chainIdHex = (chainId: number | string) => {
  if (typeof chainId === 'string') {
    if (chainId.startsWith('0x')) return chainId;
    return '0x' + chainId;
  }
  return '0x' + chainId.toString(16);
}

export const walletIsAuthorized = async (provider?: any) => {
  const known = checkForKnownProviders();
  if (Object.entries(known).length > 0) {
    const nativeProvider = Object.values(known)[0] as any;
    if ('request' in nativeProvider && typeof nativeProvider.request === 'function') {
      const currentAccount = (await nativeProvider.request({method: 'eth_accounts'}))[0] || false;
      const chainId = (await nativeProvider.request({method: 'eth_chainId'})) || false;
      if (currentAccount && chainId) {
        ga.event({
          action: 'authorized_wallet_success',
          params: {
            already_connected: true
          }
        })
      }
      return {currentAccount, chainId, provider: nativeProvider};
    }
  }
  return Promise.resolve(false);
}

export const authorizeInjected = async (quiet = true, web3Modal: Core, currentProvider: any) => {
  let provider;
  try {
    if (!quiet) {
      const instance = web3Modal.cachedProvider
        ? await web3Modal.connectTo(web3Modal.cachedProvider)
        : await web3Modal.connect();
      provider = new Web3Provider(instance, 'any');
      provider.pollingInterval = publicRuntimeConfig.rpcPollingInterval;
      const network = await provider.getNetwork();
      const accounts = await provider.listAccounts();
      ga.event({
        action: 'authorized_wallet_success',
        params: {
          type: "ethereum_other"
        }
      })
      return {network, accounts, provider}
    } else {
      console.log('quiet', currentProvider, web3Modal.cachedProvider)
      if (!currentProvider) return {};
      provider = new Web3Provider(currentProvider.provider, 'any');
      provider.pollingInterval = publicRuntimeConfig.rpcPollingInterval;
      if (web3Modal.cachedProvider) {
        const network = await provider.getNetwork();
        let accounts = await provider.listAccounts();
        if (!accounts || accounts.length === 0) {
          await currentProvider.provider.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          })
          accounts = await currentProvider.provider.request({method: 'wallet_request', params: []});
        }
        console.log(network, accounts)
        ga.event({
          action: 'authorized_wallet_success',
          params: {
            type: "ethereum_native"
          }
        })
        return {network, accounts, provider}
      } else
        return { provider }
    }
  } catch (e) {
    console.log(e)
    ga.event({
      action: 'authorized_wallet_failure',
      params: {
        type: "ethereum"
      }
    })
  }
}

export const authorizeWalletConnect = async (quiet = true) => {
  // console.log('auth wc', quiet)
  let provider, wcProvider;
  try {
    wcProvider = new WalletConnectProvider({
      ...wcProviderOptions,
      qrcodeModal: WalletConnectQRCodeModal,
      qrcode: !quiet
    })
    provider = new Web3Provider(wcProvider, 'any')
    provider.pollingInterval = publicRuntimeConfig.rpcPollingInterval;
    const accounts = await wcProvider.enable();
    if (accounts) {
      ga.event({
        action: 'authorized_wallet_success',
        params: {
          type: "wallet_connect",
          already_connected: true
        }
      })
      return {provider, accounts, instance: wcProvider};
    } else {
      const accounts = await wcProvider.request({method: 'eth_accounts', params: []});
      ga.event({
        action: 'authorized_wallet_success',
        params: {
          type: "wallet_connect",
          already_connected: false
        }
      })
      return {provider, accounts, instance: wcProvider}
    }
  } catch (e) {
    ga.event({
      action: 'authorized_wallet_failure',
      params: {
        type: "wallet_connect",
      }
    })
    console.log(e);
    return { provider, instance: wcProvider }
  }
}


