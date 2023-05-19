import {TEventsState, TUserState, TWeb3State, TXenGlobalState,} from "../types";

const initialXenGlobalState: TXenGlobalState = {
  genesisTs: 0,
  globalRank: 0,
  activeMinters: 0,
  activeStakes: 0,
  totalSupply: 0n,
  totalXenStaked: 0n,
  currentMaxTerm: 0,
  currentAMP: 0,
  currentEAA: 0,
  currentAPY: 0
};

const initialUserState: TUserState = {
  balance: 0,
  mintInfo: null,
  stakeInfo: null,
}

const initialEventsState: TEventsState = {
  subscribed: false,
  totalClaim: 0,
  totalMint: 0,
  totalStake: 0,
  totalWithdraw: 0,
  claim: [],
  mint: [],
  stake: [],
  withdraw: []
}

const initialState: TWeb3State = {
  networkInfo: {},
  globalState: {},
  // LEGACY
  // web3 state - global
  global: initialXenGlobalState,
  user: initialUserState,
  events: initialEventsState
};

export default initialState;
