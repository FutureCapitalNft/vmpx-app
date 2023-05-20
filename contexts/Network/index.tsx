import {debug} from 'debug';
import {createContext, useContext, useEffect, useReducer, useState} from "react";
import getConfig from "next/config";
import networks, {TNetworkConfig} from "../../config/networks";
import {configureNetwork} from "./configureNetwork";
import {connectProvider} from "./connectProvider";
import {NotificationsContext} from "../Notifications";
import {CurrentNetworkContext} from "../CurrentNetwork";
import {TNetworkInfo} from "../types";
import {ThemeContext} from "../Theme";
import {checkForKnownProviders} from "./knownProviders";
import {providerOptions} from "./providerOptions";
import * as Web3Modal from "web3modal";
import WalletConnect from "@walletconnect/client";

const log = debug('context:network');
const error = debug('context:network:error');

const { publicRuntimeConfig } = getConfig();
const supportedNetworks = networks({ config: publicRuntimeConfig });

const init = () => (initialState: any) => {
  return {
    ...initialState,
  }
}

export const reducer = (state: any, {type, id, config}: any) => {
  switch (type) {
    case "networkInfo":
      return {
        ...state,
        [id]: {
          ...state[id],
          ...config
        }
      };
    default:
      return state;
  }
}

const initialState = {
}

export const NetworkContext = createContext<any>(initialState);

export const NetworkProvider = ({ children }: any) => {
  const { networkId } = useContext(CurrentNetworkContext);
  const { mode } = useContext(ThemeContext);
  const [networkInfo, dispatchInfo] = useReducer(reducer, initialState, init());
  const [connected, setConnected] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [helper, setHelper] = useState<any>();
  const [instance, setInstance] = useState(null);
  const [connector, setConnector] = useState<WalletConnect>();
  const [injected, setInjected] = useState<any>();
  const [currentProvider, setCurrentProvider] = useState(null);
  const [configured, setConfigured] = useState(false);
  const { message } = useContext(NotificationsContext);

  const getCurrentNetwork = () => Object.values(supportedNetworks)
    .find((n: TNetworkConfig) => n.networkId === networkId);

  const disconnect = async () => {
    if (connector) {
      try {
        await connector.killSession();
        setConnected(false);
        message.info('WC provider disconnected')
      } catch (e) {
        error(e);
        message.warn('Error disconnecting')
      }
    } else {
      try {
        localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
        setConnected(false);
        message.info('Provider disconnected')
      } catch (e) {
        error(e);
        message.warn('Error disconnecting')
      }
    }
  }

  const connect = async () => {
    if (connector) {
      try {
        await connector.createSession();
      } catch (e) {
        message.warn('Error connecting WC')
      }
    }
  }

  useEffect(() => {
    const knownProviders = checkForKnownProviders();
    log('known providers', knownProviders);
    if (Object.values(knownProviders).length > 0) {
      const options = Object.entries(providerOptions)
        .reduce((res, [k, v]) => {
          const key = k.replace('custom-', '');
          if (Object.keys(knownProviders).includes(key)) {
            res[k] = v;
          }
          return res;
        }, {} as any);
      const web3Modal = new Web3Modal.default({
        // disableInjectedProvider: true,
        network: networkId || undefined, // optional
        cacheProvider: true, // optional
        providerOptions: options, // required
        theme: mode,
      })
      setHelper(web3Modal);
    } else {
      const connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
      })
      setHelper(connector);
    }
  }, []);

  useEffect(() => {
    (async () => {
      for await (const network of Object.values(supportedNetworks)) {
        let config: Partial<TNetworkInfo> | null = null;
        try {
          config = { isLoading: true }
          dispatchInfo({ type: 'networkInfo', id: Number(network.chainId), config });
          config = await configureNetwork(network);
        } catch (e: any) {
          error('config all', network.networkId, e)
          config = {
            chainId: Number(network.chainId),
            error: true,
            errorText: e.message,
            isLoading: false,
            defaultProvider: null,
            contractAddress: network.contractAddress,
          }
        } finally {
          dispatchInfo({ type: 'networkInfo', id: Number(network.chainId), config });
        }
      }
    })()
      .then(_ => setConfigured(true))
      .catch(error)
  }, [networkId])

  useEffect(() => {
    connectProvider(networkId || '', helper)
      .then(p => {
        if (p && typeof p === 'object') {
          log('current provider connected', networkId, p);
          setCurrentProvider(p.provider);
          setInjected(p.injected);    // native Ethereum
          setInstance(p.instance);    // Web3Modal | WalletConnect
          setConnector(p.connector);  // WalletConnect Connector
          setConnected(p.connector?.session || !!p.injected);
          if (p.connector) {
            p.connector?.on("connect", () => setConnected(true));
            p.connector?.on("disconnect", () => setConnected(false))
          } else {
            p.instance?.on("connect", () => setConnected(true));
            p.instance?.on("disconnect", () => setConnected(false));
          }
        }
      })
      .catch(error)
  }, [networkId]);

  useEffect(() => {
    if (configured) {
      if (injected) {
        if (injected._metamask) {
          injected._metamask.isUnlocked().then(setUnlocked);
        }
      }
    }
  }, [configured])

  return (
    <NetworkContext.Provider value={{
      networkInfo,
      helper,
      currentProvider,
      injected,
      getCurrentNetwork,
      configured,
      connected,
      unlocked,
      disconnect
    }} >
      { children }
    </NetworkContext.Provider>
  )
};
