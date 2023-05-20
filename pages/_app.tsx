import debug from 'debug';
import getConfig from "next/config";
import Layout from '../layouts/Layout';
import {NotificationsProvider} from "@/contexts/Notifications";
import {NetworkProvider} from "@/contexts/Network";
import {WalletProvider} from "@/contexts/Wallet";
import {Web3Provider} from "@/contexts/Web3";
import {ConsentProvider} from "@/contexts/Consent";
import {CurrentNetworkProvider} from "@/contexts/CurrentNetwork";
// import '../styles/fonts/stylesheet.css';
import RequireAuthorized from "../components/requireAuthorized";
import networks from "../config/networks";
import {useRouter} from "next/router";
const { publicRuntimeConfig } = getConfig();
debug.enable(publicRuntimeConfig.debug);
const supportedNetworks = networks({ config: publicRuntimeConfig });

const DynamicLayout = ({ Component, pageProps, networkId }: any) => {
  const router = useRouter();
  if (Component.getLayout) {
    return Component.getLayout({ Component, pageProps, networkId, query: router.query });
  } else if (networkId) {
    return (
      <Layout projectId="vmpx"
              contractAddress={supportedNetworks?.[networkId]?.contractAddress} >
          <RequireAuthorized>
            <Component {...pageProps} networkId={networkId} />
          </RequireAuthorized>
      </Layout>
    )
  } else {
    return (
      <Layout projectId="vmpx"
              contractAddress={supportedNetworks?.[networkId]?.contractAddress}>
          <Component {...pageProps} networkId={networkId} />
      </Layout>
    )
  }
}
function VmpxApp({ Component, pageProps, networkId }: any) {
  return (
    <div>
      <CurrentNetworkProvider networkId={networkId}>
          <NotificationsProvider>
            <NetworkProvider>
              <WalletProvider>
                <ConsentProvider>
                  <Web3Provider>
                    <DynamicLayout pageProps={pageProps}
                                   Component={Component}
                                   networkId={networkId} />
                  </Web3Provider>
                </ConsentProvider>
              </WalletProvider>
            </NetworkProvider>
          </NotificationsProvider>
      </CurrentNetworkProvider>
    </div>
  )
}

VmpxApp.getInitialProps = async (context: any) => {
  const {networkId} = context.router.query;
  return { networkId }
}

export default VmpxApp
