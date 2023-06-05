import {
  AppBar, Avatar,
  Box,
  Stack,
  Toolbar,
  useTheme
} from "@mui/material";
import SelectNetworkButton from "../components/selectNetworkButton";
import ConnectWalletButton from "../components/connectWalletButton";
import React, {Dispatch, SetStateAction, useContext} from "react";
import {useRouter} from "next/router";
import getConfig from "next/config";
import Alerts from "./Alerts";
import {Web3Context} from "@/contexts/Web3";
import Link from "next/link";

const {publicRuntimeConfig: config} = getConfig();

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
  const {state} = useContext(Web3Context);

  const isHomePage = router.asPath === '/';

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="fixed"
              elevation={0}>
        <Alerts/>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link href="/" passHref >
            <Avatar src={'/favicon.ico'} />
          </Link>
          <Stack direction="row" sx={{ alignItems: 'center' }}>
          {!isHomePage && <Box sx={{
            mx: 2,
            color: theme.palette.text.primary,
            display: {xs: 'none', xl: 'block'}
          }}>
              VMPX: {(state.user?.balance || 0).toLocaleString()}
          </Box>}
          <SelectNetworkButton/>
          <ConnectWalletButton/>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default ApplicationBar
