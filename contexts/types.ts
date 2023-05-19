export type TXenGlobalState = {
  genesisTs: number;
  globalRank: number;
  activeMinters: number;
  activeStakes: number;
  totalXenStaked: number | bigint;
  totalSupply: number | bigint;
  currentMaxTerm: number;
  currentAMP: number;
  currentEAA: number;
  currentAPY: number;
}

export type TXenTorrentState = {
  startBlockNumber: number;
  genesisTs: number;
  tokenIdCounter: number;
  specialClassesBurnRates: bigint[];
  specialClassesTokenLimits: number[];
  specialClassesCounters: number[];
  powerGroupSize: number;
  specialCategoriesVMUThreshold: number; // SPECIAL_CATEGORIES_VMU_THRESHOLD
  allowance: bigint;
}

export type TXenStakeState = {
  tokenIdCounter: number;
  allowance: bigint;
}

export type TXenBurnState = {
  tokenIdCounter: number;
  allowance: bigint;
}

export type TXenKnightsState = {
  bids: any;
  startTs: number;
  endTs: number;
  maxWinners: number;
  totalPlayers: number;
  totalToBurn: bigint;
  leaderboard: any[] | null;
  allowance: bigint;
  isOwner: boolean;
  status: number;
}

export type TDbXenState = {
  allowance: bigint;
  maxBPS: number;
  scalingFactor: bigint;
  xenBatchAmount: bigint;
  totalNumberOfBatchesBurned: number;
}

export type TXenlonMarsState = {
  allowance: bigint;
  initialTimestamp: number;
  burnTimestamps: number[];
  totalBurns: number;
  xlonPerDXN: number;
}

export type TFenixState = {
  allowance: bigint;
  genesisTs: number;
  cooldownUnlockTs: number;
  xenBurnRatio: number;
  rewardPoolSupply: bigint;
  shareRate: number;
  equityPoolSupply: bigint;
  equityPoolTotalShares: number;
}

export type TMintInfo = {
  user: string | null;
  term: number;
  maturityTs: number;
  rank: number;
  amp: number;
  eaa: number;
}

export type TStakeInfo = {
  user: string | null;
  amount: bigint;
  term: number;
  maturityTs: number;
  apy: boolean;
}

export type TXenTorrentInfo = {
  account: string | null;
  tokenId: number;
  term: number;
  maturityTs: number;
  rank: number;
  amp: number;
  eaa: number;
  series: number;
  redeemed: number;
  vmuCount: number;
  image: string;
}

export type TXenStakeInfo = {
  account: string | null;
  tokenId: number;
  term: number;
  maturityTs: number;
  apy: number;
  rarityScore: number;
  image: string;
}

export type TTxInfo = {
  type: 'claim' | 'mint' | 'stake' | 'withdraw'
    | 'bulk_claim' | 'bulk_mint' | 'torrent_claim' | 'torrent_mint'
    | 'xen_approve' | 'xen_transfer' | 'torrent_transfer';
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
  mintInfo: TMintInfo;
  stakeInfo: TStakeInfo;
  bulkMints: Record<number, any>;
  xenTorrents: Record<number, TXenTorrentInfo>;
  xenLowBurnTorrents: Record<number, TXenTorrentInfo>;
  xenStakes: Record<number, TXenStakeInfo>;
  pendingTransactions: Record<string, TTxInfo>
}

export type TNetworkInfo = {
  chainId: number;
  error: boolean;
  errorText?: string | null;
  isLoading: boolean;
  defaultProvider: any;
  contractAddress: string | number | null;
  bulkMinterAddress: string | number | null;
  torrentAddress: string | number | null;
  lowBurnMinterAddress: string | number | null;
  stakerAddress: string | number | null;
  burnerAddress: string | number | null;
  knightsAddress: string | number | null;
  dbXenAddress: string | number | null;
  dbXenViewsAddress: string | number | null;
  dxnTokenAddress: string | number | null;
  xenlonMarsAddress: string | number | null;
  xlonTokenAddress: string | number | null;
  fenixAddress: string | number | null;
  xen: TXenGlobalState,
  xenTorrent: TXenTorrentState,
  xenLowBurnTorrent: TXenTorrentState,
  user: Record<string, TUserAccountInfo>,
}

export type TUserState = {
  balance: number; // in ethers
  mintInfo: any;
  stakeInfo: any;
}

export type TUserXeNFTState = {
  xeNFTs: any;
  stakeXeNFTs: any;
  burnXeNFTs: any;
  lowBurnXeNFTs: any;
}

export type TUserXenKnightsState = {
  knightsStakes: any;
}

export type TUserDbXenState = {
  balance: bigint;
  accAccruedFees: bigint;
  accCycleBatchesBurned: number;
  accFirstStake: bigint;
  accRewards: bigint;
  accSecondStake: bigint;
  accWithdrawableStake: bigint;
  lastActiveCycle: number;
  lastFeeUpdateCycle: number;
  firstStakeCycleAmount: bigint;
  secondStakeCycleAmount: bigint
}

export type TUserXenlonMarsState = {
  balance: bigint;
  burnsByUser: bigint;
}

export enum TFenixStateStatus {
  ACTIVE,
  DEFER,
  END
}

export type TFenixStakeInfo = {
  status: TFenixStateStatus;
  startTs: number;
  deferralTs: number;
  endTs: number;
  term: number;
  fenix: bigint;
  shares: number;
  payout: bigint;
}

export type TUserFenixState = {
  balance: bigint;
  stakeCount: number;
  // userStakes: TFenixStakeInfo[];
  userStakes: any[];
}

export type TEventsState = {
  subscribed: boolean;
  totalClaim: number;
  totalMint: number;
  totalStake: number;
  totalWithdraw: number;
  claim: any[];
  mint: any[];
  stake: any[];
  withdraw: any[];
}

export type TWeb3State = {
  networkInfo: Record<number, TNetworkInfo>;
  globalState: Record<number, TXenGlobalState>;
  // legacy
  global: TXenGlobalState;
  user: TUserState;
  events: TEventsState;
}

export type TXeNFTState = {
  torrentState: Record<number, TXenTorrentState>;
  lowBurnTorrentState: Record<number, TXenTorrentState>;
  stakeState: Record<number, TXenStakeState>;
  burnState: Record<number, TXenBurnState>;
  // legacy
  xenTorrent: TXenTorrentState;
  xenLowBurnTorrent: TXenTorrentState;
  user: TUserXeNFTState;
}

export type TKnightsGlobalState = {
  knightsState: Record<number, TXenKnightsState>;
  // legacy
  user: TUserXenKnightsState;
}

export type TDbXenGlobalState = {
  dbXenState: Record<number, TDbXenState>;
  // legacy
  user: TUserDbXenState;
}

export type TXenlonMarsGlobalState = {
  xenlonMarsState: Record<number, TXenlonMarsState>;
  // legacy
  user: TUserXenlonMarsState;
}

export type TFenixGlobalState = {
  fenixState: Record<number, TFenixState>;
  // legacy
  user: TUserFenixState;
}


// LEGACY TYPE
/*
export type TAppState = {
  store: any;
  connector: any;
  wsProvider: any;
  provider: any;
  signer: any;
  chainId: number | null;
  contractAddress: string | null;
  minterAddress: string | null;
  accounts: string[] | null;
  alerts: any[];
  messages: any[];
  theme: string | null;
  isLoading: string | boolean;
  isProcessing: boolean;
  isHydrated: boolean;
  isSwitching: boolean;
  networkInfo: Record<number, TNetworkInfo>;
  // legacy
  global: TXenGlobalState;
  xenTorrent: TXenTorrentState;
  xenLowBurnTorrent: TXenTorrentState;
  user: TUserState;
  events: TEventsState;
}
 */

