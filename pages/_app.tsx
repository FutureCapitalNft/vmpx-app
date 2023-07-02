import "../styles/circles.scss";
import '@rainbow-me/rainbowkit/styles.css';

import debug from 'debug';
import getConfig from "next/config";
import Layout from '../layouts/Layout';
import {NotificationsProvider} from "@/contexts/Notifications";
import {ConsentProvider} from "@/contexts/Consent";
import {CurrentNetworkProvider} from "@/contexts/CurrentNetwork";
import networks from "../config/networks";
import {useRouter} from "next/router";
import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {configureChains, createConfig, WagmiConfig} from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { infuraProvider } from "wagmi/providers/infura";
import {VmpxProvider} from "@/contexts/VMPX";
import { supportedChains } from "@/config/chains";

const { publicRuntimeConfig } = getConfig();
debug.enable(publicRuntimeConfig.debug);
const supportedNetworks = networks({ config: publicRuntimeConfig });

const chainById = (id: number) => Object.values(supportedNetworks).find(n => Number(n.chainId) === id);

const chains = supportedChains;
const projectId = publicRuntimeConfig?.walletConnectApiKey;

const { connectors } = getDefaultWallets({
  appName: 'Xen Network',
  projectId,
  chains
});

const getRPCs = (chain: any) => ({
  http: Array.isArray(chainById(chain.id)?.rpcURL) ? chainById(chain.id)?.rpcURL?.[0] : chainById(chain.id)?.rpcURL as string,
  webSocket: Array.isArray(chainById(chain.id)?.wsURL) ? chainById(chain.id)?.wsURL?.[0] : chainById(chain.id)?.wsURL as string
})

const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  [
    infuraProvider({
      apiKey: publicRuntimeConfig.infuraId
    }),
    jsonRpcProvider({
      rpc: getRPCs as any
    })
  ]
)
const wagmiConfig = createConfig({
  autoConnect: true,
  persister: null,
  connectors,
  publicClient,
  webSocketPublicClient
})

const DynamicLayout = ({ Component, pageProps, networkId }: any) => {
  const router = useRouter();
  if (Component.getLayout) {
    return Component.getLayout({ Component, pageProps, networkId, query: router.query });
  } else if (networkId) {
    return (
      <Layout projectId="vmpx"
              contractAddress={supportedNetworks?.[networkId]?.contractAddress} >
        <Component {...pageProps} networkId={networkId} />
      </Layout>
    )
  } else {
    return (
      <Layout projectId="vmpx"
              contractAddress={supportedNetworks?.[networkId || 'mainnet']?.contractAddress}>
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
            <WagmiConfig config={wagmiConfig}>
              <RainbowKitProvider chains={chains} coolMode={true} theme={darkTheme()}>
                <ConsentProvider>
                  <VmpxProvider>
                    <DynamicLayout pageProps={pageProps}
                                   Component={Component}
                                   networkId={networkId} />
                  </VmpxProvider>
                </ConsentProvider>
              </RainbowKitProvider>
            </WagmiConfig>
          </NotificationsProvider>
      </CurrentNetworkProvider>
    </div>
  )
}

VmpxApp.getInitialProps = async (context: any) => {
  const {networkId = 'mainnet' } = context.router.query;
  return { networkId }
}

export default VmpxApp
