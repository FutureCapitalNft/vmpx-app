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
import {CurrentNetworkContext} from "@/contexts/CurrentNetwork";
import Link from "next/link";
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
import {useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction} from "wagmi";
import {NotificationsContext} from "@/contexts/Notifications";
import {ConsentContext} from "@/contexts/Consent";

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


const NetworkPage = ({}: any) => {
  const {message} = useContext(NotificationsContext);
  const {networkId} = useContext(CurrentNetworkContext);
  const { requestTermsAcceptance, termsAccepted } = useContext(ConsentContext);
  const {chain} = useNetwork();
  const { global, refetchUserBalance, refetchVmpx } = useContext(VmpxContext);
  const [power, setPower] = useState(1);

  const hasVmpx = networkId
    && supportedNetworks[networkId]?.contractAddress;

  const ethersInWei = BigInt('1000000000000000000');

  const vmpxIsActive = hasVmpx
    && typeof supportedNetworks[networkId].contractAddress === 'string'
    && isAddress(supportedNetworks[networkId].contractAddress?.toString() || '');

  const globalState: TVmpx = global[chain?.id as number];
  const batch = Number((globalState?.batch || 0n) / ethersInWei);

  const maxSafeVMUs = networkId
    && Number(supportedNetworks[networkId]?.maxSafeVMUs) || 256;

  useEffect(() => {
    console.log('globalState', globalState);
  }, [globalState]);

  const remainingToMint = globalState?.totalSupply > 0n
    ? Number((globalState?.cap || 0n) / ethersInWei)
    - Number((globalState?.totalSupply || 0n) / ethersInWei)
    : 0;
  const maxPossibleVMUs = Math.min(maxSafeVMUs, Math.floor(remainingToMint / batch));

  const onPowerChange = (_: any, v: any) => {
    if (Number(v) > maxPossibleVMUs) {
      setPower(maxPossibleVMUs)
    } else {
      setPower(Number(v))
    }
  }

  const setMinPower = () => {
    setPower(Number(1))
  }

  const decPower = () => {
    setPower(p => Math.max(p - 1, 1))
  }

  const incPower = () => {
    setPower(p => Math.min(p + 1, maxPossibleVMUs))
  }

  const setMaxPower = () => {
    setPower(Number(maxPossibleVMUs))
  }

  const { config: mintConfig } = usePrepareContractWrite({
    address: supportedNetworks[networkId!]?.contractAddress,
    abi: contractABI,
    chainId: chain?.id,
    functionName: 'mint',
    args: [power]
  } as any);

  const { isLoading: isMintLoading, writeAsync: mint, data: mintTx } = useContractWrite(mintConfig);

  const { isLoading: isMintWaiting } = useWaitForTransaction({
    ...mintTx,
    confirmations: 1,
    onSuccess: () => {
      message.info('VMPX Minted')
      refetchUserBalance()
        .then(() => refetchVmpx())
    }
  })

  const loading = isMintLoading || isMintWaiting;

  const requireTermsAccepted = async () => {
    if (!termsAccepted) {
      const res = await requestTermsAcceptance();
      if (!res) throw new Error('Terms not accepted');
    }
  }

  const doMint = async () => {
    try {
      if (config.requireTermsSigning) await requireTermsAccepted();
      mint && await mint();
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
        {!vmpxIsActive && <Container sx={{textAlign: 'center' }}>
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
        {vmpxIsActive && <Container sx={{textAlign: 'center', padding: 3 }}>
          <Image
              width={245}
              height={71}
              src="/VMPX.svg"
              alt="VMPX logo" />
            <StyledSubH
            variant="subtitle2" sx={{ mb: 4 }}>
            ERC-20
          </StyledSubH>
          <Grid container sx={{ maxWidth: 450, justifyContent: 'center', margin: 'auto' }}>
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
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                  <StyledP
                      variant="body1"
                      className={gentumFontClass} >
                      Power
                  </StyledP>
              </Grid>
            <Grid item xs={12} sx={{ textAlign: 'left', mt: 4 }}>
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
                      onChange={onPowerChange}
                      valueLabelDisplay={chain?.unsupported ? "off" : "on"}
                      step={1}
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
            </Grid>
            <Grid item xs={12} sx={{ py: 2, mt: 2 }}>
              <StyledLoadingButton
                size="large"
                color="error"
                variant={loading ? "outlined" : "contained"}
                disabled={!mint || chain?.unsupported}
                disableElevation
                loading={loading}
                loadingPosition="end"
                endIcon={!chain?.unsupported ? <KeyboardArrowRightIcon/> : <></>}
                onClick={doMint} >
                {chain?.unsupported && 'Unsupported network'}
                {!chain?.unsupported && !loading && `Mint ${(power * batch).toLocaleString()} VMPX`}
                {!chain?.unsupported && loading && 'Minting'}
              </StyledLoadingButton>
            </Grid>
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

export const getStaticPaths = async () => {
  return {
    paths: Object.keys(supportedNetworks).map(id => `/${id}`),
    fallback: false
  }
};

export const getStaticProps = async () => {
  return {props: {}}
};

export default NetworkPage
