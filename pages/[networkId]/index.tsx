import getConfig from "next/config";
import { isAddress } from '@ethersproject/address'
import networks from "@/config/networks";
import styles from "@/styles/Home.module.css";
import Head from "next/head";
import React, {useContext, useEffect, useState} from 'react';
import {LoadingButton} from '@mui/lab';
import {
  Box, Button,
  Container, Grid, Slider, Stack,
  Typography,
} from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {Web3Context} from "@/contexts/Web3";
import {CurrentNetworkContext} from "@/contexts/CurrentNetwork";
import {TVmpxGlobalState} from "@/contexts/types";
import Link from "next/link";
import {disclaimer} from "@/components/disclaimer";
import styled from "@emotion/styled";
import {ThemeContext} from "@/contexts/Theme";

const {publicRuntimeConfig: config} = getConfig();
const supportedNetworks = networks({config});

const StyledSlider = styled(Slider)(() => ({
  mx: 8,
  mt: 4,
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
  fontWeight: 'bold',
  letterSpacing: '0.1rem',
  fontFamily: 'Italiana',
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
  fontFamily: 'Gentium Basic',
  color: theme.palette?.grey?.[theme.palette?.mode === 'dark' ? 500 : 800],
  // fontWeight: 'bold',
  marginBottom: 24,
}))

const StyledDisclaimer = styled(Typography)(({ theme }: any) => ({
  maxWidth: '900px',
  margin: 'auto',
  marginTop: 12,
  fontSize: 12,
  // fontFamily: 'Italiana',
  color: theme.palette?.grey?.[theme.palette?.mode === 'dark' ? 500 : 800]
}))

const StyledLoadingButton = styled(LoadingButton)(() => ({
  borderRadius: 33,
  height: 60,
  backgroundColor: '#650F10',
  textTransform: 'unset',
  '&:hover': { backgroundColor: '#A41E14'}
}))

const NetworkPage = ({}: any) => {
  const { mode } = useContext(ThemeContext);
  const {networkId} = useContext(CurrentNetworkContext);
  const {ready, initState, syncState, syncUser, mint, state} = useContext(Web3Context);
  const [power, setPower] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasVmpx = networkId
    && supportedNetworks[networkId]?.contractAddress;

  const ethersInWei = BigInt('1000000000000000000');

  const vmpxIsActive = hasVmpx
    && typeof supportedNetworks[networkId].contractAddress === 'string'
    && isAddress(supportedNetworks[networkId].contractAddress?.toString() || '');

  const globalState: TVmpxGlobalState = state.globalState[networkId as any];
  const batch = Number((globalState?.batch || 0n) / ethersInWei);

  useEffect(() => {
    // console.log('index', ready, networkId);
    if (ready && networkId && vmpxIsActive) {
      initState(networkId)
        .then(_ => syncState(networkId))
        .then(_ => syncUser(networkId))
    }
  }, [ready, networkId, vmpxIsActive]);

  useEffect(() => {
    // console.log('globalState', globalState);
  }, [globalState]);

  const onPowerChange = (_: any, v: any) => {
    setPower(Number(v))
  }

  const setMaxPower = () => {
    setPower(Number(256))
  }

  const doMint = async () => {
    setLoading(true);
    await mint(power);
    await syncUser(networkId || undefined);
    setLoading(false);
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
        {!vmpxIsActive && <Container sx={{textAlign: 'center' }}>
            <StyledH
                variant="h3" >
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
          <StyledH
            variant="h1" >
            VMPX
          </StyledH>
            <StyledSubH
            variant="subtitle2" sx={{ mb: 4 }}>
            ERC-20
          </StyledSubH>
          <Grid container sx={{ maxWidth: 400, justifyContent: 'center', margin: 'auto' }}>
            <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <StyledP variant="body1">Max. Supply</StyledP>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <StyledP variant="body1">
                  {((globalState?.cap || 0n) / ethersInWei).toLocaleString()}
                </StyledP>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <StyledP variant="body1">Minted</StyledP>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <StyledP variant="body1">
                  {globalState?.totalSupply?.toLocaleString()}
                </StyledP>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'left', mt: 4 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-around' }}>
                    <StyledP variant="body1"  style={{ marginRight: '16px' }}>
                        Power
                    </StyledP>
                  <StyledSlider
                      value={power}
                      onChange={onPowerChange}
                      valueLabelDisplay="on"
                      step={1}
                      min={1}
                      max={256} />
                  <Button
                      disableRipple
                      disabled={power === 256}
                      onClick={setMaxPower}
                      sx={{
                        ml: 2,
                        color: mode === 'dark' ? 'white': 'black'
                  }}>
                      MAX
                  </Button>
                </Stack>
            </Grid>
            <Grid item xs={12} sx={{ py: 2, mt: 2 }}>
              <StyledLoadingButton
                size="large"
                color="error"
                variant={loading ? "outlined" : "contained"}
                disableElevation
                loading={loading}
                loadingPosition="end"
                endIcon={<KeyboardArrowRightIcon/>}
                onClick={doMint} >
                {loading ? 'Minting' : `Mint ${(power * batch).toLocaleString()} VMPX`}
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
