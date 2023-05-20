import React, {useContext, useEffect, useState} from "react";
import Image from 'next/image';
import {Badge, Button, Divider, MenuItem, Popover, Stack} from "@mui/material";
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import styled from "@emotion/styled";
import {WalletContext} from "@/contexts/Wallet";
import {NetworkContext} from "@/contexts/Network";
import {NotificationsContext} from "@/contexts/Notifications";
import {Web3Context} from "@/contexts/Web3";
import {ThemeContext} from "@/contexts/Theme";

const StyledMenuItem = styled(MenuItem)(() => ({
  '&.MuiButtonBase-root, .MuiMenuItem-root': { fontSize: '13pt' }
}));

const ConnectWalletButton = () => {
  const { isLarge } = useContext(ThemeContext);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const { notifications } = useContext(NotificationsContext);
  const { connected: isConnected, helper } = useContext(NetworkContext);
  const { authorized, accounts, disconnectWallet, authorizeWallet } = useContext(WalletContext);
  const { state } = useContext(Web3Context);
  const [walletLogo, setWalletLogo] = useState<string | null>();

  const isAuthorized = authorized && accounts && accounts[0];

  useEffect(() => {
    // console.log('wallet', isAuthorized, isConnected, helper)
    if (isAuthorized && isConnected && helper && typeof helper.getUserOptions === 'function') {
      const cachedProvider = helper?.cachedProvider || localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER');
      setWalletLogo((helper?.getUserOptions() || [])
        .find((w: any) => w.id === cachedProvider)?.logo);
    } else if (isAuthorized && isConnected && helper && helper.protocol === 'wc') {
      setWalletLogo('/logos/wallet-connect-logo.png');
    }
    if (!isConnected) {
      setWalletLogo(null);
    }
  }, [isAuthorized, isConnected])

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const authorize = (_: React.MouseEvent<HTMLButtonElement>) => {
    authorizeWallet(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const userAccount = accounts
    && accounts[0]
    && accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4)

  const onDisconnectClick = () => {
    if (isAuthorized) {
      disconnectWallet().then(_ => handleClose())
    }
  }

  return (
    <>
      <Badge badgeContent={notifications.isProcessing ? "!" : 0} color="primary">
      <Button variant="outlined"
              startIcon={walletLogo ? <Image src={walletLogo} alt="" width={20} height={20} /> : <></>}
              endIcon={open ? <ArrowUpIcon /> : <ArrowDownIcon />}
              sx={{ borderRadius: 25, textTransform: 'unset' }}
              onClick={isAuthorized ? openMenu : authorize }
              color={ isConnected ? 'success' : 'primary' }>
        {isAuthorized && (isLarge ? userAccount : <WalletIcon />)}
        {!isAuthorized && !notifications.isProcessing && (isLarge ? 'Connect Wallet' : 'Connect')}
        {!isAuthorized && notifications.isProcessing && ('Connecting...')}
      </Button>
      </Badge>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Stack direction="column" sx={{  }}>
          {!isLarge && <StyledMenuItem >
            Address: {userAccount}
          </StyledMenuItem>}
          {!isLarge && <StyledMenuItem >
              VMPX balance: {(state.user?.balance || 0).toLocaleString()}
          </StyledMenuItem>}
          {!isLarge && <Divider />}
          {notifications.isProcessing && <StyledMenuItem disabled
                                           sx={{ textTransform: 'unset', textAlign: 'right' }}>
            Wallet action(s) pending...
          </StyledMenuItem>}
          <StyledMenuItem onClick={onDisconnectClick}
                  sx={{ textTransform: 'unset', textAlign: 'right' }}>
            Disconnect Wallet
          </StyledMenuItem>
        </Stack>
      </Popover>
    </>
  )
};

export default ConnectWalletButton;
