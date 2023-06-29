
export type TVmpx = {
  cap: bigint,
  cycles: bigint,
  startBlockNumber: bigint,
  counter: bigint,
  batch: bigint,
  totalSupply: bigint,
}

export type TVmpxUser = {
  balance: bigint;
}

export type TVmpxContext = {
  global: Record<number, TVmpx>,
  user: Record<number, Record<string, TVmpxUser>>,
  isFetching: boolean,
  refetchUserBalance: () => any,
  refetchVmpx: () => any,
}
