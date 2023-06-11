import {createContext, useEffect, useState} from "react";
import {useRouter} from "next/router";

type TCurrentNetworkContext = {
  networkId: string | null;
  onNetworkMismatch: (walletNetworkId: string) => Promise<string | null>
}

const initialValue: TCurrentNetworkContext = {
  networkId: null,
  onNetworkMismatch: _ => Promise.resolve(null)
}

export const CurrentNetworkContext = createContext<TCurrentNetworkContext>(initialValue);

export const CurrentNetworkProvider = ({ children, networkId: currentNetworkId }: any) => {
  const router = useRouter();
  const [path, setPath] = useState(router.asPath);
  const [networkId, setNetworkId] = useState(currentNetworkId);

  const handleRouteChange = (url = '/') => {
    setPath(url);
    setNetworkId(url.split('/')[1]);
  }

  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  const onNetworkMismatch = (walletNetworkId: string) => {
    /*
    const subPath = path
      .replace(networkId, '')
      .replace(/\//, '');
    if (networkId) {
      const url = `/${walletNetworkId}/${subPath}`;
      return router.replace(url)
        .then(() => walletNetworkId);
    } else {
      return Promise.resolve(networkId);
    }
     */
    return Promise.resolve(walletNetworkId);
  }

  return (
    <CurrentNetworkContext.Provider value={{ networkId, onNetworkMismatch }}>
      {children}
    </CurrentNetworkContext.Provider>
  )
}
