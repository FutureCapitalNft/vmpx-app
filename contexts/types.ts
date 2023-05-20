export type TVmpxGlobalState = {
  cap: bigint;
  cycles: number;
  counter: number;
  batch: bigint;
  totalSupply: bigint;
}

export type TTxInfo = {
  type: 'mint' | 'transfer';
  chainId: number;
  account: string;
  hash: string;
  status: 'draft' | 'error' | 'pending' | 'failed' | 'dropped' | 'OK';
  receipt: any;
  result: any;
  error: any;
}

export type TUserAccountInfo = {
  balance: bigint;
  account: string | null;
  pendingTransactions: Record<string, TTxInfo>
}

export type TNetworkInfo = {
  chainId: number;
  error: boolean;
  errorText?: string | null;
  isLoading: boolean;
  defaultProvider: any;
  contractAddress: string | number | null;
  vmpx: TVmpxGlobalState,
  user: Record<string, TUserAccountInfo>,
}

export type TUserState = {
  balance: number; // in ethers
}

export type TEventsState = {
  subscribed: boolean;
  totalMint: number;
  mint: any[];
}

export type TWeb3State = {
  networkInfo: Record<number, TNetworkInfo>;
  globalState: Record<number, TVmpxGlobalState>;
  // legacy
  global: TVmpxGlobalState;
  user: TUserState;
  events: TEventsState;
}


