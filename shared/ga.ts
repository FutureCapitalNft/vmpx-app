// log the pageview with their URL
export const event = ({ action, params={} }: any) => {
  if (window && (window as any).gtag) {
    const networkId = location?.pathname?.split('/')[1] || 'mainnet';
    if (networkId) {
      params['network_id'] = networkId;
    }
    (window as any).gtag('event', action, params);
  }
}

// VMPX related

export const gaWalletConnected = (address: string) => event({
  action: 'wallet_connected',
  params: {
    address
  }
})

export const gaWalletDisconnected = () => event({
  action: 'wallet_disconnected',
  params: {
  }
})

export const gaMintSuccess = (address: string, power: number) => event({
  action: 'mint_success',
  params: {
    address, power
  }
})

export const gaMintFailure = (address: string, power: number) => event({
  action: 'mint_failure',
  params: {
    address, power
  }
})



