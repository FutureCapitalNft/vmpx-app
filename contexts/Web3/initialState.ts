import {TEventsState, TUserState, TWeb3State, TVmpxGlobalState,} from "../types";

const initialVmpxGlobalState: TVmpxGlobalState = {
  cap: 0n,
  cycles: 0,
  counter: 0,
  batch: 0n,
  totalSupply: 0n,
};

const initialUserState: TUserState = {
  balance: 0,
}

const initialEventsState: TEventsState = {
  subscribed: false,
  totalMint: 0,
  mint: [],
}

const initialState: TWeb3State = {
  networkInfo: {},
  globalState: {},
  // LEGACY
  // web3 state - global
  global: initialVmpxGlobalState,
  user: initialUserState,
  events: initialEventsState
};

export default initialState;
