import {
  AppBar, Avatar,
  Box,
  IconButton, Stack,
  Toolbar,
  Tooltip,
  useTheme
} from "@mui/material";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import SelectNetworkButton from "../components/selectNetworkButton";
import ConnectWalletButton from "../components/connectWalletButton";
import React, {Dispatch, SetStateAction, useContext, useState} from "react";
import {useRouter} from "next/router";
import getConfig from "next/config";
import Alerts from "./Alerts";
import {WalletContext} from "@/contexts/Wallet";
import {NotificationsContext} from "@/contexts/Notifications";
import {Web3Context} from "@/contexts/Web3";
import {CurrentNetworkContext} from "@/contexts/CurrentNetwork";
import {ThemeContext} from "@/contexts/Theme";

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
  const {mode, setMode} = useContext(ThemeContext);
  const {networkId} = useContext(CurrentNetworkContext);
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {} = useContext(NotificationsContext);
  const {walletNetworkId} = useContext(WalletContext);
  const {state} = useContext(Web3Context);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', mode === 'dark' ? 'light' : 'dark')
    }
  }

  const isHomePage = router.asPath === '/';

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="fixed"
              elevation={0}>
        <Alerts/>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Avatar src={'/favicon.ico'} />
          <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Tooltip title="Toggle light/dark mode">
            <IconButton sx={{ml: 1}} onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7Icon/> : <Brightness4Icon sx={{color: 'black'}}/>}
            </IconButton>
          </Tooltip>
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
