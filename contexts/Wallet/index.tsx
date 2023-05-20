import debug from 'debug';
import {createContext, useContext, useEffect, useState} from "react";
import networks, {TNetworkConfig} from "../../config/networks";
import {authorizeInjected, authorizeWalletConnect} from "./authorizeWallet";
import {NetworkContext} from "../Network";
import getConfig from "next/config";
import {NotificationsContext} from "../Notifications";
import * as ga from "@/shared/ga";
import {CurrentNetworkContext} from "../CurrentNetwork";

const log = debug('context:wallet');
const error = debug('context:wallet:error');

const { publicRuntimeConfig } = getConfig();
const supportedNetworks = networks({ config: publicRuntimeConfig });

export type TWalletContext = {
  wallet: any;
  authorized: boolean;
  accounts: null | string[] | undefined,
  walletNetworkId: undefined | string;
  requestNetwork: (id?: string | null) => Promise<void>;
  authorizeWallet: (q?: boolean) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  addToken: (...params: any) => Promise<void>;
}

const initialState: Partial<TWalletContext> = {
  wallet: null,
  authorized: false,
  accounts: null,
  walletNetworkId: undefined
};

const getNetworkByChainId = (chainId: number | string) =>
  Object.values(supportedNetworks)
    .find((n: TNetworkConfig) => Number(n.chainId) === Number(chainId));

const getNetworkByNetworkId = (networkId: string | null) =>
  Object.values(supportedNetworks)
    .find((n: TNetworkConfig) => n.networkId === networkId);

export const WalletContext = createContext<TWalletContext>(initialState as TWalletContext);

export const WalletProvider = ({ children }: any) => {
  const { networkId, onNetworkMismatch } = useContext(CurrentNetworkContext);
  const {
    currentProvider,
    connected,
    injected,
    disconnect,
    helper
  } = useContext(NetworkContext);
  const { message, setProcessing } = useContext(NotificationsContext);

  const [wallet, setWallet] = useState<any>();
  const [walletName, setWalletName] = useState<string | null>();
  const [authorized, setAuthorized] = useState(false);
  const [walletNetworkId, setWalletNetworkId] = useState<string>();
  const [accounts, setAccounts] = useState<string[] | null>();

  useEffect(() => {
    if (!connected) {
      // setAuthorized(false);
    }
  }, [connected]);

  const onAccountsChanged = (newAccounts: string[] = []) => {
    if ((accounts || []).every(e => newAccounts.includes(e))) {
      log('new accounts', newAccounts);
      setAccounts(newAccounts);
    }
    if (!accounts || accounts.length === 0) {
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }

  const onChainChanged = (chainId: string) => {
    const target = getNetworkByChainId(chainId);
    if (target?.networkId !== walletNetworkId) {
      log('new chain', chainId);
      setWalletNetworkId(target?.networkId);
    }
  }

  const onWCEvent = (err: Error | null, payload: any) => {
    if (err) {
      error('wc error', err);
      message.warning('WalletConnect Error');
    } else {
      // console.log('wc event', payload)
      switch (payload.event) {
        case 'disconnect':
          message.info('Wallet disconnected');
          setWallet(null);
          setAccounts(null);
          setAuthorized(false);
          break;
        case 'connect':
          message.success('Wallet connected');
          break;
        case 'session_update':
        default:
          // console.log('wc event', payload.event, payload.params[0]);
      }
    }
  }

  const subscribeToWalletEvents = (provider: any) => {
    if (provider?.on) provider?.on("accountsChanged", onAccountsChanged);
    if (provider?.on) provider?.on("chainChanged", onChainChanged);
  }

  /*
  const unsubscribeFromWalletEvents = (provider) => {
    if (provider?.off) provider?.off("accountsChanged", onAccountsChanged);
    if (provider?.off) provider?.off("chainChanged", onChainChanged);
  }
   */

  const disconnectWallet = async () => {
    try {
      await disconnect();
      setWallet(null);
      setWalletName(null);
      setAccounts(null);
      setAuthorized(false);
    } catch (_) {
      // message.warn('Error disconnecting')
    }
  }

  const requestAddChain = async (networkId: string) => {
    log('add chain', networkId, wallet)
    if (wallet && networkId) {
      const target = getNetworkByNetworkId(networkId);
      if (target) {
        const chainId = target.chainId;
        let currentWallet = ('request' in wallet.provider) ? wallet.provider : injected;
        if ('ethereum' in currentWallet) {
          // hack for Bitkeep
          currentWallet = currentWallet.ethereum;
        }
        const rpcUrls = typeof target.rpcURL === 'string'
          ? [target.rpcURL]
          : target.rpcURL;
        const blockExplorerUrls = [target.explorerUrl];
        return currentWallet.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId,
            chainName: target.name,
            nativeCurrency: {
              symbol: target.currencyUnit,
              decimals: target.decimals || 18
            },
            rpcUrls,
            blockExplorerUrls,
          }]
        })
      }
    } else {
      error('no wallet or network Id')
    }
  }

  const requestNetwork = async (networkId: string | null | undefined) => {
    log('req', networkId, authorized, wallet);
    if (!authorized) {
      await authorizeWallet();
    }
    if (wallet && networkId) {
      const target = getNetworkByNetworkId(networkId);
      if (target) {
        const chainId = target.chainId;
        let currentWallet = ('request' in wallet) ? wallet : wallet.provider;
        if (!currentWallet) currentWallet = ('request' in wallet?.provider) ? wallet.provider : injected;
        // if (!currentWallet) currentWallet = ('request' in injected) && injected;
        if ('ethereum' in currentWallet) {
          // hack for Bitkeep
          currentWallet = currentWallet.ethereum;
        }
        if (Number(currentWallet?.chainId) === Number(chainId)) {
          return;
        }
        setProcessing(true);
        try {
          await currentWallet.request({
            method: 'wallet_switchEthereumChain',
            params: [{chainId}],
          })
        } catch (e: any) {
          if (e.message === 'User rejected the request.') {
            message.warning('Rejected by user');
            throw e; // to be processed downstream
          } else {
            // console.log(e);
            try {
              await requestAddChain(networkId)
                // .then(_ => console.log('added'));
              await currentWallet.request({
                method: 'wallet_switchEthereumChain',
                params: [{chainId}],
              })
            } catch (e) {
              error('second attempt', e);
              message.warning('Failed');
            }
          }
        } finally {
          setProcessing(false);
        }
      }
    }
  }

  const authorizeWallet = async (quiet = false) => {
    log('authorize, q=', quiet, authorized)
    if (!authorized) {
      if (helper && helper.protocol !== 'wc') {
        setProcessing(true)
        authorizeInjected(
          typeof quiet === 'boolean' && quiet === true,
          helper,
          currentProvider
        )
          .then(res => {
            if (!res) {
              message.warning('Please check your wallet')
              return;
            }
            const target = getNetworkByChainId(res?.network?.chainId || 1);
            setAuthorized(!!res.accounts && !!res.accounts[0]);
            setWallet(res.provider);
            setWalletName('native');
            subscribeToWalletEvents(res.provider?.provider);
            //subscribeToWalletEvents(res.provider);
            //subscribeToWalletEvents(helper);
            setAccounts(res.accounts);
            // console.log('provider authed', res);
            if (target?.networkId === networkId || !networkId) {
              setWalletNetworkId(target?.networkId);
            }
          })
          .catch(e => {
            error(e);
            message.warning('Cannot authorize')
          })
          .finally(() => setProcessing(false))
      } else {
        await authorizeWalletConnect(typeof quiet === 'boolean' && quiet === true)
          .then(res => {
            const target = getNetworkByChainId(res?.instance?.chainId || 1);
            subscribeToWalletEvents(res?.instance);
            res.instance?.wc?.on("session_update", onWCEvent)
            res.instance?.wc?.on("connect", onWCEvent)
            res.instance?.wc?.on("disconnect", onWCEvent)
            setAuthorized(res.accounts && res.accounts[0]);
            setWalletName('walletconnect');
            setWallet(res?.provider);
            setAccounts(res?.accounts);
            if (target?.networkId === networkId || !networkId) {
              setWalletNetworkId(target?.networkId);
            }
          }).catch(e => {
            error(e);
            message.warning('Cannot authorize')
          })
      }
    }
  }

  useEffect(() => {
    if (currentProvider) {
      // console.log('quiet auth', currentProvider, injected);
      authorizeWallet(true)
        .then(_ => {})
        .catch(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProvider]);

  const addToken = async (
    address: string,
    image = '',
    symbol = "XEN",
    decimals = 18,
    type = 'ERC20'
  ) => {
    if (!wallet) return;

    try {
      let currentWallet = ('request' in wallet) && wallet;
      if (!currentWallet) currentWallet = ('request' in wallet.provider) && wallet.provider;
      if (!currentWallet) currentWallet = ('request' in injected) && injected;
      const wasAdded = await currentWallet.request({
        method: 'wallet_watchAsset',
        params: {
          type, // Initially only supports ERC20, but eventually more!
          options: {
            address, // The address that the token is at.
            symbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals, // The number of decimals in the token
            image, // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        message.info(`XEN Crypto added to wallet`)

        ga.event({
          action: 'add_token_success',
        })
      }
    } catch (e: any) {
      message.warning(`Error adding XEN Crypto: ${e.message}`)
      ga.event({
        action: 'add_token_failure',
      })
    }
  }

  /*
      Possible routes changes:
      - (url != provider.network) -> wallet.request_change- > onChainChanged -> router change
      - select network button -> wallet.request_change -> onChainChanged -> router change
      - wallet select network -> onChainChanged -> router change
   */
  useEffect(() => {
    if (wallet) {
      if (walletNetworkId && networkId) {
        log(networkId, '>', walletNetworkId);
        if (walletNetworkId !== networkId) {
          onNetworkMismatch(walletNetworkId)
            .then(_ => {})
            .catch(error);
        }
      } else if (!walletNetworkId && networkId) {
        log(' unknown >', networkId);
        requestNetwork(networkId)
          .then(_ => {})
          .catch(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, walletNetworkId, networkId])

  return (
    <WalletContext.Provider value={{
      wallet,
      authorized,
      accounts,
      walletNetworkId,
      requestNetwork,
      authorizeWallet,
      disconnectWallet,
      addToken,
    }} >
      { children }
    </WalletContext.Provider>
  )
};
