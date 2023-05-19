export const knownProviders = [
  'ethereum',
  'okxwallet',
  'bitkeep',
  'trustwallet'
];
export const checkForKnownProviders = () => {
  return knownProviders.reduce((res, p) => {
    if (typeof window !== 'undefined' && window[p])
      res[p] = window[p];
    return res;
  }, {});
}
