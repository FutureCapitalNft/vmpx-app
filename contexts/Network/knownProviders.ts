export const knownProviders = [
  'ethereum',
  'okxwallet',
  'bitkeep',
  'trustwallet'
];
export const checkForKnownProviders = () => {
  return knownProviders.reduce((res, p) => {
    if (typeof window !== 'undefined' && window[p as any])
      res[p] = window[p as any];
    return res;
  }, {} as any);
}
