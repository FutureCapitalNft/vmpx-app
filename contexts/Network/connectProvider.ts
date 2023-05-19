import {Web3Provider} from "@ethersproject/providers";
import Core, {Modal} from "web3modal";
import * as ga from "@/shared/ga";
import WalletConnect from "@walletconnect/client";
import getConfig from "next/config";
import networks from "../../config/networks";
import {checkForKnownProviders} from "./knownProviders";
import {wcProviderOptions} from "./providerOptions";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";

const { publicRuntimeConfig } = getConfig();
const currentNetworks = networks({config: publicRuntimeConfig});

let connector: WalletConnect; // WalletConnect connector instance

export const connectProvider = async (networkId: string, helper: Core) => {
  let provider: any, instance: any, injected: any;
  const known = Object.values(checkForKnownProviders());
  console.log(known);
  if (typeof window !== 'undefined' && known.length > 0) {
    if (known.length === 1) {
        provider = new Web3Provider(known[0] as any, networkId || 'any');
        instance = known[0];
        injected = known[0];
    } else {
      let cachedProviderName = localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER");
      cachedProviderName = cachedProviderName ? cachedProviderName.slice(1, -1) : null;
      if (cachedProviderName) {
        if (cachedProviderName === 'injected') {
          instance = window.ethereum;
          injected = window.ethereum;
        } else {
          const key = cachedProviderName.replace('custom-', '');
          const custom = window[`${key}` as any];
          console.log(key, custom)
          injected = ('otherEthereum' in custom) ? custom.ethereum : custom;
          instance = ('otherEthereum' in custom) ? custom.ethereum : custom;
        }
        if (instance) {
          provider = new Web3Provider(instance, networkId || 'any');
        }
      } else {
        instance = window.ethereum;
        injected = instance;
        provider = new Web3Provider(instance, networkId || 'any');
      }
    }
    if (!provider) return null;

    provider.pollingInterval = publicRuntimeConfig.rpcPollingInterval;
    return provider.provider.request({ method: 'eth_chainId' })
      .then((n: string) => {
        const id = Number(n)
        ga.event({
          action: 'connect_provider_success'
        })
        return { provider, instance, injected }
      })
      .catch((e: any) => {
        console.error(e)
        ga.event({
          action: 'connect_provider_failure'
        })
        return null
      })

  } else {

    // no Ethereum => use WalletConnect
    const wcProvider = new WalletConnectProvider({
      ...wcProviderOptions,
      qrcodeModal: WalletConnectQRCodeModal,
      qrcode: undefined
    })

    try {
      if (!connector) {
        connector = new WalletConnect({
          bridge: "https://bridge.walletconnect.org", // Required
        })
        ga.event({
          action: 'connect_provider_success'
        })
      }

      if (connector && connector.connected) {
        if (!wcProvider.connected) {
          await wcProvider.enable()
        }
        provider = new Web3Provider(wcProvider, 'any');
        wcProvider.pollingInterval = publicRuntimeConfig.rpcPollingInterval;
        provider.pollingInterval = publicRuntimeConfig.rpcPollingInterval;
        ga.event({
          action: 'connect_provider_success'
        })
        return {provider, instance: wcProvider, connector}
      } else {
        await connector.createSession();
        provider = new Web3Provider(wcProvider, 'any');
        wcProvider.pollingInterval = publicRuntimeConfig.rpcPollingInterval;
        provider.pollingInterval = publicRuntimeConfig.rpcPollingInterval;
        ga.event({
          action: 'connect_provider_success'
        })
        return {provider, instance: wcProvider, connector}
      }
    } catch (e) {
      console.log(e);
      return {provider, instance: wcProvider, connector}
    }

  }

}
