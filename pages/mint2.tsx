import getConfig from "next/config";
import { isAddress } from '@ethersproject/address'
import networks from "@/config/networks";
import styles from "@/styles/Home.module.css";
import Head from "next/head";
import React, {useContext, useEffect, useState} from 'react';
import {LoadingButton} from '@mui/lab';
import {
  Box, Button,
  Container, Grid, IconButton, Slider, Stack,
  Typography,
} from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Link from "next/link";
import Countdown from 'react-countdown';
import {disclaimer} from "@/components/disclaimer";
import styled from "@emotion/styled";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import {gentumFontClass, italianaFontClass} from "@/lib/fonts";
import Image from 'next/image'
import {VmpxContext} from "@/contexts/VMPX";
import {TVmpx} from "@/contexts/VMPX/types";
import {
  useAccount, useBlockNumber,
  useNetwork,
  useWaitForTransaction, useWalletClient
} from "wagmi";
import {NotificationsContext} from "@/contexts/Notifications";
import {ConsentContext} from "@/contexts/Consent";
import {gaMintFailure, gaMintSuccess, gaWalletConnected, gaWalletDisconnected} from "@/shared/ga";
// import {CurrentNetworkContext} from "@/contexts/CurrentNetwork";

const {publicRuntimeConfig: config} = getConfig();
const supportedNetworks = networks({config});
const contractABI = config.vmpxABI;

const StyledSlider = styled(Slider)(() => ({
  '& .MuiSlider-thumb': {
    color: '#A41E14'
  },
  '& .MuiSlider-track': {
    color: '#A41E14'
  },
  '& .MuiSlider-rail': {
    color: '#650F10'
  }
}))

const StyledP = styled(Typography)(() => ({
  maxWidth: '900px',
  margin: 'auto',
  fontWeight: 400,
  // fontWeight: 'bold',
  letterSpacing: '0.1rem',
  fontFamily: 'Gentium Plus',
}))

const StyledH = styled(Typography)(() => ({
  maxWidth: '900px',
  margin: 'auto',
  fontFamily: 'Italiana',
  // fontWeight: 'bold',
}))

const StyledSubH = styled(Typography)(({ theme }: any) => ({
  maxWidth: '900px',
  margin: 'auto',
  fontFamily: 'Gentium Plus',
  color: theme.palette?.grey?.[theme.palette?.mode === 'dark' ? 400 : 700],
  // fontWeight: 'bold',
  marginBottom: 24,
}))

const StyledCountdown = styled(Typography)(({ theme }: any) => ({
  maxWidth: '900px',
  margin: 'auto',
  fontFamily: 'Gentium Plus',
  color: theme.palette?.grey?.[theme.palette?.mode === 'dark' ? 400 : 700],
}))

const StyledDisclaimer = styled(Typography)(({ theme }: any) => ({
  maxWidth: '900px',
  margin: 'auto',
  marginTop: 12,
  fontSize: 13,
  fontFamily: 'Gentium Plus',
  color: theme.palette?.grey?.[theme.palette?.mode === 'dark' ? 400 : 700],
}))

const StyledLoadingButton = styled(LoadingButton)(({ theme }: any) => ({
  borderRadius: 33,
  height: 60,
  width: 250,
  textTransform: 'unset',
  fontFamily: 'Gentium Basic',
  color: 'white',
  '&.Mui-disabled' : { color: 'rgba(255, 255, 255, 0.6)' },
  backgroundColor: '#650F10',
  '&:hover': { backgroundColor: '#A41E14'}
}))

const ethersInWei = BigInt('1000000000000000000');

const onConnect = ({ address }: any) => gaWalletConnected(address);
const onDisconnect = () => gaWalletDisconnected();

const MintPage2 = () => {
  const {message} = useContext(NotificationsContext);
  const networkId = 'mainnet'
  // const {networkId} = useContext(CurrentNetworkContext);
  const { requestTermsAcceptance, termsAccepted } = useContext(ConsentContext);
  const {chain} = useNetwork();
  const {address} = useAccount({ onConnect, onDisconnect });
  const { data: walletClient } = useWalletClient({
    chainId: chain?.id
  });
  const { data: blockNumber } = useBlockNumber({
    chainId: chain?.id,
    watch: true
  })
  const { global, refetchUserBalance, refetchVmpx } = useContext(VmpxContext);
  const [power, setPower] = useState(1);
  const [committedPower, setCommittedPower] = useState(1);
  const [gas, setGas] = useState<bigint>(0n);
  const [started, setStarted] = useState(false);
  const [hash, setHash] = useState<`0x${string}`>();

  const hasVmpx = !!(networkId && supportedNetworks[networkId]?.contractAddress);

  const vmpxIsActive = hasVmpx
    && typeof supportedNetworks[networkId].contractAddress === 'string'
    && isAddress(supportedNetworks[networkId].contractAddress?.toString() || '');

  const globalState: TVmpx = global[chain?.id as number];
  const batch = Number((globalState?.batch || 0n) / ethersInWei);

  const maxSafeVMUs = networkId
    && Number(supportedNetworks[networkId]?.maxSafeVMUs) || 256;

  const mintingHasStarted = (globalState?.startBlockNumber || 0n) < (blockNumber || globalState?.startBlockNumber || 0n);
  // const mintingHasStarted = true;
  const blocksToStart = (globalState?.startBlockNumber || 0n) - (blockNumber || globalState?.startBlockNumber || 0n);
  const mintingIsOver = globalState?.totalSupply === globalState?.cap;

  const blockTime = supportedNetworks[networkId || '']?.blockTimeMs || 12_000;

  useEffect(() => {
    setGas(BigInt(700 * 200 * committedPower + 90_000));
  }, [committedPower, batch, networkId, address]);

  const remainingToMint = globalState
    ? Number((globalState?.cap || 0n) / ethersInWei)
    - Number((globalState?.totalSupply || 0n) / ethersInWei)
    : 0;
  const maxPossibleVMUs = Math.min(maxSafeVMUs, Math.floor(remainingToMint / batch));

  const changeHandler = (_: any, v: any) => {
    if (Number(v) > maxPossibleVMUs) {
      setPower(maxPossibleVMUs);
    } else {
      setPower(Number(v));
    }
  };

  const committedHandler = (_: any, v: any) => {
    if (Number(v) > maxPossibleVMUs) {
      setCommittedPower(maxPossibleVMUs);
    } else {
      setCommittedPower(Number(v));
    }
  };

  const setMinPower = () => {
    setPower(Number(1))
    setCommittedPower(Number(1))
  }

  const decPower = () => {
    setPower(p => Math.max(p - 1, 1))
    setCommittedPower(p => Math.max(p - 1, 1))
  }

  const incPower = () => {
    setPower(p => Math.min(p + 1, maxPossibleVMUs))
    setCommittedPower(p => Math.min(p + 1, maxPossibleVMUs))
  }

  const setMaxPower = () => {
    setPower(Number(maxPossibleVMUs))
    setCommittedPower(Number(maxPossibleVMUs))
  }

  useEffect(() => {
    console.log(blockNumber)
    if (!started && globalState?.startBlockNumber === 0n) {
      setStarted(true);
    }
    if (!started && globalState?.startBlockNumber > 0n && ((blockNumber || 0n) > globalState?.startBlockNumber)) {
      setStarted(true)
    }
  }, [blockNumber, globalState?.startBlockNumber, started])

  const { isLoading: isMintWaiting } = useWaitForTransaction({
    hash,
    confirmations: 1,
    onSuccess: () => {
      gaMintSuccess(address as string, committedPower)
      message.info('VMPX Minted')
      refetchUserBalance()
        .then(() => refetchVmpx())
    },
    onError: (err) => {
      gaMintFailure(address as string, committedPower)
    }
  })

  const loading = isMintWaiting;

  const requireTermsAccepted = async () => {
    if (!termsAccepted) {
      const res = await requestTermsAcceptance();
      if (!res) throw new Error('Terms not accepted');
    }
  }

  const doMint = async () => {
    try {
      if (config.requireTermsSigning) await requireTermsAccepted();
      if (walletClient) {
        const hash = await walletClient.writeContract({
          address: supportedNetworks[networkId!]?.contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'mint',
          args: [committedPower],
          gas: (gas * 108n) / 100n,
        });
        setHash(hash);
      }
    } catch (e: any) {
      if (e.shortMessage) {
        message.warning(e.shortMessage);
      } else if (e.message) {
        message.warning(e.message);
      }
    }
  }

  const pctMinted = globalState
    ? Number(globalState?.totalSupply * 100n / globalState?.cap).toFixed(1)
    : '-';

  const minted = globalState
    ? ((globalState?.totalSupply || 0n) / ethersInWei).toLocaleString()
    : '-';

  const maxSupply = globalState
    ? ((globalState?.cap || 0n) / ethersInWei).toLocaleString()
    : '-';

  const calcDate = (blocksToStart: bigint) => {
    const date = new Date(Date.now() + Number(blocksToStart) * blockTime);
    // console.log(date);
    return date;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{`VMPX`}</title>
        <meta name="description"
              content="VMPX. Fair Launch and distribution"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <div id="live-gradient" className={styles.liveGradient} >
      <Box>
        {!address && <Box sx={{ py: 2, mt: 2 }}>
            <StyledCountdown sx={{ textAlign: 'center' }}>Please Connect Wallet</StyledCountdown>
        </Box>}
        {address && !vmpxIsActive && <Container sx={{textAlign: 'center' }}>
            <StyledH
                variant="h3"
                className={italianaFontClass}>
                Not here... yet
            </StyledH>
            <Link href="/" passHref >
              <Button
                  size="large"
                  color="success"
                  variant="outlined"
                  sx={{ borderRadius: 25, mt: 4 , width: 250, height: 60, textTransform: 'unset', fontWeight: 'bold' }} >
                  Back to Dripping Screen
              </Button>
            </Link>
        </Container>}
        {address && vmpxIsActive && <Container sx={{textAlign: 'center', padding: 1 }}>
          <Image
              width={245}
              height={71}
              src="/VMPX.svg"
              alt="VMPX logo" />
            <StyledSubH
            variant="subtitle2" sx={{ mb: 1 }}>
            ERC-20
          </StyledSubH>
          <Grid container sx={{ maxWidth: 450, justifyContent: 'center', margin: 'auto' }}>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                  <StyledSubH
                      variant="body1" >
                      Alternative Minting Page
                  </StyledSubH>
              </Grid>
            <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <StyledP
                    className={gentumFontClass}
                    variant="body1" >
                    Max. Supply
                </StyledP>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <StyledP
                    variant="body1"
                    className={gentumFontClass} >
                  {maxSupply}
                </StyledP>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <StyledP
                    variant="body1"
                    className={gentumFontClass} >
                    Minted
                </StyledP>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <StyledP
                    variant="body1"
                    className={gentumFontClass} >
                  {!chain?.unsupported && `(${pctMinted}%)`} {minted}
                </StyledP>
            </Grid>
            {address && !mintingIsOver && mintingHasStarted && <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                  <StyledP
                      variant="body1"
                      className={gentumFontClass} >
                      Power
                  </StyledP>
              </Grid>}
            {address && !mintingIsOver && mintingHasStarted && <Grid item xs={12} sx={{ textAlign: 'left', mt: 4 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-around' }}>
                    <IconButton
                        size="small"
                        disabled={chain?.unsupported}
                        onClick={setMinPower}>
                        <FirstPageIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        disabled={chain?.unsupported}
                        onClick={decPower}>
                        <RemoveIcon />
                    </IconButton>
                  <StyledSlider
                      value={power}
                      disabled={chain?.unsupported}
                      onChange={changeHandler}
                      onChangeCommitted={committedHandler}
                      valueLabelDisplay={chain?.unsupported ? "off" : "on"}
                      step={1}
                      marks
                      min={1}
                      max={maxSafeVMUs}
                      sx={{ mx: 2 }}/>
                    <IconButton
                        size="small"
                        disabled={chain?.unsupported}
                        onClick={incPower}>
                        <AddIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        disabled={chain?.unsupported}
                        onClick={setMaxPower}>
                        <LastPageIcon />
                    </IconButton>
                </Stack>
            </Grid>}
            {address && !mintingIsOver && mintingHasStarted && <Grid item xs={12} sx={{ py: 1, mt: 2 }}>
              <StyledLoadingButton
                size="large"
                color="error"
                variant={loading ? "outlined" : "contained"}
                disabled={chain?.unsupported}
                disableElevation
                loading={loading}
                loadingPosition="end"
                endIcon={!chain?.unsupported ? <KeyboardArrowRightIcon/> : <></>}
                onClick={doMint} >
                {chain?.unsupported && 'Unsupported network'}
                {!chain?.unsupported && !loading && `Mint ${(power * batch).toLocaleString()} VMPX`}
                {!chain?.unsupported && loading && 'Minting'}
              </StyledLoadingButton>
            </Grid>}
            {address && !mintingIsOver && mintingHasStarted && <Grid item xs={12} sx={{ py: 2 }}>
                <Typography variant="body2">
                  Gas: {((gas * 108n) / 100n).toLocaleString()}
                </Typography>
            </Grid>}
            {address && mintingIsOver && mintingHasStarted && <Grid item xs={12} sx={{ py: 2, mt: 2 }}>
                <StyledSubH variant="h4" >Minting Is Over</StyledSubH>
            </Grid>}
            {address && !mintingHasStarted && <Container sx={{textAlign: 'center', padding: 3 }}>
                <StyledCountdown>Minting starts in </StyledCountdown>
                <Countdown
                    key={blockNumber?.toString()}
                    className="countdown-text"
                    daysInHours
                    zeroPadTime={2}
                    date={calcDate(blocksToStart)}
                />
            </Container>}
          </Grid>
            <StyledDisclaimer
                variant="body2" >
                DISCLAIMER: {disclaimer}
            </StyledDisclaimer>
        </Container>}
      </Box>
      </div>
    </div>
  )
}

export const getStaticProps = async () => {
   return {props: {}}
};

export default MintPage2
