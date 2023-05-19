import debug from 'debug';
import {TWeb3State} from "../types";
// import {dedupeArray} from "../../shared/dedupeArray";
import init from "./initialState";

const log = debug('context:web3:state');
const error = debug('context:web3:error');

export type TWeb3StateAction = {
  type: string;
  payload: any;
  id?: string | null;
  meta?: any;
}

export const reducer = (state: TWeb3State, action: TWeb3StateAction): TWeb3State => {
  if (['setGlobal', 'setGlobalRank'].includes(action.type)
    || ['push','inc','setTotal'].reduce((r,e)=>r||action.type.startsWith(e),false)) {
    log(action.type, action.meta, action.id, action.payload);
  }

  switch (action.type) {
    case "setNetworkConfig":
      if (action.payload.id in state.networkInfo) {
        return {
          ...state,
          networkInfo: {
            ...state.networkInfo,
            [action.payload.id]: {
              ...state.networkInfo[action.payload.id],
              ...action.payload.config
            },
          }
        };
      }
      return {
          ...state,
          networkInfo: {
            [action.payload.id]: action.payload.config,
            ...state.networkInfo
          }
        };
    case "setNetworkLoading":
      if (action.payload.id in state.networkInfo) {
        return {
          ...state,
          networkInfo: {
            [action.payload.id]: {
              ...state.networkInfo[action.payload.id],
              isLoading: action.payload.isLoading
            },
            ...state.networkInfo
          }
        };
      }
      return state;
    case "setGlobal":
      if (action.id) {
        return {
          ...state,
          globalState: {
            ...state.globalState,
            [action.id]: {
              ...state.globalState[action.id],
              ...action.payload
            }
          },
        };
      }
      error('no id for', action.type)
      return state;
    case "setGlobalRank":
      error('deprecated', action.type)
      return state;
    case "setEventsSubscribed":
      error('deprecated', action.type)
      return state;
    case "pushClaimEvent":
      error('deprecated', action.type)
      return state;
    case "pushMintEvent":
      error('deprecated', action.type)
      return state;
    case "pushStakeEvent":
      error('deprecated', action.type)
      return state;
    case "pushWithdrawEvent":
      error('deprecated', action.type)
      return state;
    case "incTotalClaim":
      error('deprecated', action.type)
      return state;
    case "incTotalMint":
      error('deprecated', action.type)
      return state;
    case "incTotalStake":
      error('deprecated', action.type)
      return state;
    case "incTotalWithdraw":
      error('deprecated', action.type)
      return state;
    case "setTotalClaim":
      error('deprecated', action.type)
      return state;
    case "setTotalMint":
      error('deprecated', action.type)
      return state;
    case "setTotalStake":
      error('deprecated', action.type)
      return state;
    case "setTotalWithdraw":
      error('deprecated', action.type)
      return state;
    case "setUser":
      if (!action.payload) {
        return {
          ...state,
          user: init.user
        };
      }
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
    case "setUserBalance":
      return {
        ...state,
        user: {
          ...state.user,
          balance: action.payload
        }
      };
    case "setUserMint":
      return {
        ...state,
        user: {
          ...state.user,
          mintInfo: action.payload
        }
      };
    case "setUserStake":
      return {
        ...state,
        user: {
          ...state.user,
          stakeInfo: action.payload
        }
      };
    default:
      error('unknown action', action.type)
      return state;
  }
};

