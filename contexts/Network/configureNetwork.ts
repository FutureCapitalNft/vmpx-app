import {debug} from 'debug';

import {TNetworkConfig} from "@/config/networks";
import {getDefaultProvider, Web3Provider} from "@ethersproject/providers";
import {TNetworkInfo} from "../types";
import getConfig from "next/config";

// const log = debug('context:network');
const error = debug('context:network:error');

const { publicRuntimeConfig } = getConfig();

const options = { pollingInterval: publicRuntimeConfig.rpcPollingInterval }

const getRpcUrl = (networkConfig: TNetworkConfig) => {
  return networkConfig.rpcURL;
}

const getWsUrl = (networkConfig: TNetworkConfig) => {
  return networkConfig.wsURL;
}

export const configureNetwork = async (networkConfig: TNetworkConfig) => {
  const chainId = Number(networkConfig.chainId);
  if (typeof window === 'undefined') return null;
  const config: Partial<TNetworkInfo> = {
    ...networkConfig,
    chainId,
    error: false,
    errorText: null,
    isLoading: false,
    defaultProvider: null,
    bulkMinterAddress: null,
    torrentAddress: networkConfig.minterAddress,
  }
  const selectedChainId = Number(window.ethereum && window.ethereum.chainId || publicRuntimeConfig.chainId || 1);

  if (window.ethereum && chainId === selectedChainId) {
    config.defaultProvider = new Web3Provider(window.ethereum, selectedChainId);
    return config;
  } else {
    let baseProvider;
    const wsUrl = getWsUrl(networkConfig) || undefined;
    const rpcUrl = getRpcUrl(networkConfig) || undefined;
    try {
      if (wsUrl) {
        const url = Array.isArray(wsUrl) ? wsUrl[0] : wsUrl
        baseProvider = getDefaultProvider(url, options);
      } else {
        const url = Array.isArray(rpcUrl) ? rpcUrl[0] : rpcUrl
        baseProvider = getDefaultProvider(url, options);
        baseProvider.pollingInterval = publicRuntimeConfig.rpcPollingInterval;
      }
    } catch (e: any) {
      error('config provider', e);
      try {
        const url = Array.isArray(rpcUrl) ? rpcUrl[0] : rpcUrl
        baseProvider = getDefaultProvider(url, options);
        baseProvider.pollingInterval = publicRuntimeConfig.rpcPollingInterval;
      } catch (e: any) {
        error('config provider 2', e);
        config.error = true;
        config.errorText = e?.message;
      }
    } finally {
      const timeout = publicRuntimeConfig.providerTimeout || 5_000;
      const waitForTimeout = new Promise((resolve) => setTimeout(resolve, timeout));
      const res = await Promise.race([
        baseProvider?._networkPromise,
        waitForTimeout
      ]);
      if (res) {
        // log('network', chainId, res);
      } else {
        error('network', chainId, 'timeout');
        config.error = true;
        config.errorText = 'timeout';
      }
      config.defaultProvider = baseProvider;
      return config;
    }
  }
}
