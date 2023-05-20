import debug from 'debug';
// import useSWR from 'swr';
import {createContext, useContext, useEffect, useReducer, useState} from "react";
import {WalletContext} from "../Wallet";
import {Contract} from "@ethersproject/contracts";
import getConfig from "next/config";
import networks, {TNetworkConfig} from "../../config/networks";
import {NetworkContext} from "../Network";
import {BigNumber} from "@ethersproject/bignumber";
import {NotificationsContext} from "../Notifications";
import {reducer} from "./reducer";
import initialState from "./initialState";
import {
  gaMintFailure,
  gaMintSuccess,
} from "@/shared/ga";
import {ConsentContext} from "../Consent";
import {CurrentNetworkContext} from "../CurrentNetwork";
import {TNetworkInfo} from "../types";
import {TWeb3Context} from "./types";

const log = debug('context:web3');
const error = debug('context:web3:error');

const { publicRuntimeConfig } = getConfig();
const supportedNetworks = networks({ config: publicRuntimeConfig });

const contractABI = publicRuntimeConfig.vmpxABI;

const init = (initialState: any) => {
  return {
    ...initialState,
  }
}

const getCurrentNetwork = (networkId: string) => Object.values(supportedNetworks)
  .find((n: TNetworkConfig) => n.networkId === networkId);

export const Web3Context = createContext<TWeb3Context>({ state: initialState } as TWeb3Context);

export const Web3Provider = ({ children }: any) => {
  const { networkId } = useContext(CurrentNetworkContext);
  const [state, dispatch] = useReducer(reducer, initialState, init);
  const { setLoading, message } = useContext(NotificationsContext);
  const { networkInfo } = useContext(NetworkContext);
  const { wallet, accounts } = useContext(WalletContext);
  const { requestTermsAcceptance, termsAccepted } = useContext(ConsentContext);
  const [ready, setReady] = useState(false)

  const createVmpxContract = (id = networkId, signing = false) => {
    const chainId = getCurrentNetwork(id || 'mainnet')?.chainId;
    const currentNetwork: TNetworkInfo = chainId && networkInfo[Number(chainId)];
    if (currentNetwork
      && typeof currentNetwork.contractAddress === 'string'
      && contractABI) {
      if (signing) {
        return new Contract(currentNetwork.contractAddress, contractABI, wallet.getSigner());
      }
      return new Contract(currentNetwork.contractAddress, contractABI, currentNetwork.defaultProvider);
    } else {
      console.error('cannot create VMPX contract', id, currentNetwork)
    }
  }

  const [vmpxContract, setVmpxContract] = useState<Contract>();

  const networkReady = networkId
    && networkInfo
    && networkInfo[Number(getCurrentNetwork(networkId)?.chainId)]
    && !networkInfo[Number(getCurrentNetwork(networkId)?.chainId)]?.isLoading;

  useEffect(() => {
    if (networkReady) {
      if (wallet) {
        setVmpxContract(createVmpxContract(networkId || 'mainnet', true));
      } else {
        setVmpxContract(createVmpxContract(networkId || 'mainnet', false));
      }
      setReady(true);
      log('ready!')
    } else {
      log(
        'ready?',
        networkInfo,
        networkInfo[Number(getCurrentNetwork(networkId || 'mainnet')?.chainId)]
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, networkId, networkReady])

  const getVmpxContract = (requestedNetworkId: string | undefined, signing = false) => {
    if (!requestedNetworkId)
      return vmpxContract || createVmpxContract(undefined, signing);
    const requestedNetwork = getCurrentNetwork(requestedNetworkId);
    if (!requestedNetwork) throw new Error('no network with id ' + requestedNetworkId);
    if (!requestedNetwork.contractAddress || typeof requestedNetwork.contractAddress !== 'string')
      throw new Error('no contract address for network with id ' + requestedNetworkId);
    return createVmpxContract(requestedNetworkId, signing)
  }

  const publicFetcher = (contract: Contract) => (...args: any) => {
    const [_, method, ...params] = args;
    console.log(method, params);
    if (!contract) return null;
    return contract[method](...params)
  }

  // const { data: genesisTs, error: genesisTsError } = useSWR(['mainnet', 'genesisTs'], publicFetcher(xenContract));
  // console.log('swr', genesisTs, genesisTsError);

  const asCurrentUser = accounts ? {from: accounts[0]} : undefined;

  const etherInWei = BigInt('1000000000000000000');
  const toNumber = (bn: BigNumber | number | bigint): number => {
    if (BigNumber.isBigNumber(bn)) return bn.toNumber();
    return Number(bn);
  };
  const toBigInt = (bn: BigNumber) => bn.toBigInt();
  const asEther = (val: bigint) => val / etherInWei;

  const initState = async (requestedNetworkId?: string) => {
    //if (!requestedNetworkId && !xenContract) return null;
    const contract = getVmpxContract(requestedNetworkId || 'mainnet', false);
    if (!contract) throw new Error('cannot make contract for ' + requestedNetworkId);
    try {
      log('init state', requestedNetworkId);
      setLoading(true);
      // const fetcher0 = (method) => () => contract[method]()
      const cap = await contract.cap().then(toBigInt);
      const cycles = await contract.cycles().then(toNumber);
      const batch = await contract.BATCH().then(toBigInt);
      const globalState = {
          cap,
          cycles,
          batch
      }
      if (requestedNetworkId || networkId) {
        dispatch({
          type: 'setGlobal',
          payload: globalState,
          id: requestedNetworkId || networkId,
          meta: 'init state'
        });
      }
      log('init', requestedNetworkId, globalState);
      return globalState;
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false);
    }
  }

  const syncState = async (requestedNetworkId: string = networkId || 'mainnet') => {
    const contract = getVmpxContract(requestedNetworkId, false);
    if (!contract) throw new Error('cannot make contract for ' + requestedNetworkId);
    try {
      log('sync state', requestedNetworkId);
      setLoading(true);
      const counter = await contract.counter().then(toNumber);
      const totalSupply = await contract.totalSupply()
        .then(toBigInt).then(asEther);
      const globalState = {
        counter,
        totalSupply,
      }
      if (requestedNetworkId || networkId) {
        dispatch({
          type: 'setGlobal',
          payload: globalState,
          id: requestedNetworkId || networkId,
          meta: 'sync state ' + requestedNetworkId
        });
      }
      log('sync state', requestedNetworkId, globalState);
      return globalState;
    } catch (e) {
      error(e);
    } finally {
      setLoading(false);
    }
  }

  const syncUser = async (requestedNetworkId?: string) => {
    const contract = getVmpxContract(requestedNetworkId || 'mainnet', false);
    if (!contract) throw new Error('cannot make contract for default' + networkId);
    try {
      log('sync user', requestedNetworkId, accounts?.[0], contract);
      setLoading(true);
      const balance = await contract.balanceOf(accounts?.[0], asCurrentUser)
        .then(toBigInt).then(asEther).then(toNumber);
      const user = {
        balance,
      }
      dispatch({ type: 'setUser', payload: user });
      return user;
    } catch (e) {
      error('syncUser', e);
    } finally {
      setLoading(false);
    }
  }

  const getUserBalance = async (user?: string) => {
    if (!vmpxContract) return null;
    try {
      const balance = await vmpxContract.balanceOf(user || accounts?.[0], asCurrentUser)
        .then(toBigInt).then(asEther).then(toNumber);
      dispatch({ type: 'setUserBalance', payload: balance });
      return balance;
    } catch (e) {
      error('getUserBalance', e)
    } finally {
    }
  }

  const requireTermsAccepted = async () => {
    if (!termsAccepted) {
      const res = await requestTermsAcceptance();
      if (!res) throw new Error('Terms not accepted');
    }
  }

  const mint = async () => {
    const vmpxContract = getVmpxContract(undefined, true);
    if (!vmpxContract) throw new Error('cannot make signing VMPX contract for default ' + networkId);
    let tx;
    try {
      // log('terms accepted', termsAccepted);
      log('mint');
      if (publicRuntimeConfig.requireTermsSigning) await requireTermsAccepted();
      tx = await vmpxContract.mint()
      wallet.pollingInterval = 5_000;
      await tx.wait(publicRuntimeConfig.waitForConfirmationsNumber);
      message.info('VMPX Mint Successful')
      await syncState();
      gaMintSuccess();
    } catch (e: any) {
      error(e);
      gaMintFailure();
      if (e.reason) {
        message.warning(e.reason.replace('execution reverted: ', ''));
      } else if (e.message) {
        message.warning(e.message);
      }
    } finally {
      wallet.pollingInterval = 30_000;
    }
  }

  return (
    <Web3Context.Provider value={{
      web3Ready : ready,
      ready,
      getVmpxContract,
      initState,
      syncState,
      syncUser,
      getUserBalance,
      mint,
      state
    }} >
      { children }
    </Web3Context.Provider>
  )
}
