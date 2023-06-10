import {createContext, useState} from "react";
import {Chain, useAccount, useContractRead, useContractReads, useNetwork} from "wagmi";
import getConfig from "next/config";
import networks from "../../config/networks";
import {TVmpx, TVmpxContext, TVmpxUser} from "./types";

const { publicRuntimeConfig } = getConfig();
const supportedNetworks = networks({ config: publicRuntimeConfig });
const contractABI = publicRuntimeConfig.vmpxABI;

const initialValue: TVmpxContext = {
  global: {},
  user: {},
  isFetching: false,
  refetchUserBalance: () => {},
  refetchVmpx: () => {},
}

export const VmpxContext = createContext<TVmpxContext>(initialValue);

export const VmpxProvider = ({ children }: any) => {
  const [global, setGlobal] = useState<Record<number, TVmpx>>({} as any);
  const [user, setUser] = useState<Record<number, Record<string, TVmpxUser>>>({} as any);
  const { chain } = useNetwork();
  const { address } = useAccount();

  const vmpxContract = (chain: (Chain & {unsupported?: boolean | undefined}) | undefined) => ({
    address: Object.values(supportedNetworks)
      .find(n => Number(n?.chainId) === chain?.id)?.contractAddress as any,
    abi: contractABI,
  });

  const { isFetching, refetch: refetchVmpx } = useContractReads(
    {
    contracts: [
      { ...vmpxContract(chain), functionName: 'cap', chainId: chain?.id },
      { ...vmpxContract(chain), functionName: 'cycles', chainId: chain?.id },
      { ...vmpxContract(chain), functionName: 'counter', chainId: chain?.id },
      { ...vmpxContract(chain), functionName: 'BATCH', chainId: chain?.id },
      { ...vmpxContract(chain), functionName: 'totalSupply', chainId: chain?.id },
    ],
    onSuccess: (init) => {
      // console.log('init', chain?.id, init)
      const [
        { result: cap },
        { result: cycles },
        { result: counter },
        { result: batch },
        { result: totalSupply },
      ] = init;
      setGlobal((g) => ({
        ...g,
        [chain?.id!]: {
          ...g?.[chain?.id!],
          cap,
          cycles,
          counter,
          batch,
          totalSupply,
        } as any
      }))
    }
  });

  const { refetch: refetchUserBalance } = useContractRead({
    ...vmpxContract(chain),
    functionName: 'balanceOf',
    args: [address],
    account: address,
    chainId: chain?.id,
    onSuccess: (balance) => {
      setUser((g) => ({
        ...g,
        [chain?.id!]: {
          ...g?.[chain?.id!],
          [address!]: {
            ...g?.[chain?.id!]?.[address!],
            balance: (balance as unknown) as bigint,
          }
        }
      }))
    }
  })

  return <VmpxContext.Provider value={{
    global,
    user,
    isFetching,
    refetchVmpx,
    refetchUserBalance,
  }}>
      {children}
  </VmpxContext.Provider>
}
