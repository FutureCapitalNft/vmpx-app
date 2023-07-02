import {
  AppBar, Avatar,
  Box,
  Stack,
  Toolbar,
  useTheme
} from "@mui/material";
import React, {Dispatch, SetStateAction, useContext, useEffect} from "react";
import {useRouter} from "next/router";
import getConfig from "next/config";
import Alerts from "./Alerts";
import Link from "next/link";
import AddTokenButton from "@/components/addTokenButton";
import {CurrentNetworkContext} from "@/contexts/CurrentNetwork";
import networks from "@/config/networks";
import {watchNetwork} from "@wagmi/core";
import {VmpxContext} from "@/contexts/VMPX";
import {useAccount, useConnect, useNetwork} from "wagmi";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import {NotificationsContext} from "@/contexts/Notifications";

const {publicRuntimeConfig: config} = getConfig();
const supportedNetworks = networks({config});

interface LinkTabProps {
  label?: string;
  value?: string;
  href?: string;
  current?: string;
  theme?: any;
  items?: LinkTabProps[],
  menuEl?: HTMLElement | null,
  setMenuEl?: Dispatch<SetStateAction<HTMLElement | null>>,
}

const ApplicationBar = () => {
  const theme = useTheme();
  const router = useRouter();
  const {message} = useContext(NotificationsContext);
  const {networkId} = useContext(CurrentNetworkContext);
  const {chain} = useNetwork();
  const {address} = useAccount();
  const {user} = useContext(VmpxContext);

  const balance = user[chain?.id!]?.[address!]?.balance || 0n;

  const isHomePage = router.asPath === '/';
  const contractAddress = networkId && supportedNetworks[networkId]?.contractAddress;
  const isDev = config.nodeEnv === 'development';
  const image = `${isDev ? 'http://' : 'https://'}${config.deployedUrl}/vmpx-round-black.png`;

  useEffect(() => {
    const unwatch = watchNetwork((network) => {
      // console.log('???', router.query, network.chain);
      if (network?.chain?.unsupported) {
        message.warning('Unsupported network')
        return;
      }
      const walletNetworkId = Object.values(supportedNetworks)
        .find((n) => Number(n?.chainId) === Number(network?.chain?.id))
        ?.networkId;
      const { networkId: id = '' } = router.query;
      const networkId = Array.isArray(id) ? id[0] : id;
      const path = router.asPath;
      const subPath = path
        .replace(networkId, '')
        .replaceAll(/\//g, '');
      // console.log(path, subPath)
      if (networkId) {
        const url = `/${walletNetworkId}/${subPath}`;
        return router.replace(url)
          .then(() => walletNetworkId);
      } else {
        return Promise.resolve(networkId);
      }
    })
    return () => {
      unwatch();
    }
  }, [networkId])

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="fixed"
              elevation={0}>
        <Alerts/>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link href="/" passHref >
            <Avatar src={'/favicon.ico'} />
          </Link>
          <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
            {!isHomePage && !chain?.unsupported && <AddTokenButton
              type="VMPX"
              address={contractAddress}
              image={image} />}
          <Box sx={{
            px: 2,
            marginRight: '16px',
            color: theme.palette.text.primary,
            display: {xs: 'none', xl: 'block'}
          }}>
              VMPX: {(balance / BigInt('1000000000000000000')).toLocaleString()}
          </Box>
            <ConnectButton />
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default ApplicationBar
