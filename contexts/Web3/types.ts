import {TWeb3State} from "../types";
import {Contract} from "@ethersproject/contracts";

export type TWeb3Context = {

  // General
  state: TWeb3State;
  web3Ready: boolean;
  ready: boolean;

  getVmpxContract: (_?: string | undefined, __?: boolean | undefined) => Contract | undefined;

  // VMPX - related
  initState: (_?: string) => Promise<any>;
  syncState: (_?: string) => Promise<any>;
  syncUser: (_?: string) => Promise<any>;
  getUserBalance: (_?: string) => Promise<any>;
  mint: (_: number) => Promise<any>;
}
