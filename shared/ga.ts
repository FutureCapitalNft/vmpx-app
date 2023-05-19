// log the pageview with their URL
export const event = ({ action, params={} }: any) => {
  if (window && (window as any).gtag) {
    const networkId = location?.pathname?.split('/')[1]
    if (networkId) {
      params['network_id'] = networkId
    }
    (window as any).gtag('event', action, params)
  }
}

// VMPX related

export const gaMintSuccess = () => event({
  action: 'mint_success',
  params: {
  }
})

export const gaMintFailure = () => event({
  action: 'mint_failure',
  params: {
  }
})



