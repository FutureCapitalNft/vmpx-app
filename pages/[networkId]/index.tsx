import getConfig from "next/config";
import { isAddress } from '@ethersproject/address'
import networks from "@/config/networks";
import styles from "@/styles/Home.module.css";
import Head from "next/head";
import React, {useContext, useEffect, useState} from 'react';
import {LoadingButton} from '@mui/lab';
import {
  Box,
  Container, Grid, Stack,
  Typography,
} from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {NotificationsContext} from "@/contexts/Notifications";
import {Web3Context} from "@/contexts/Web3";
import {CurrentNetworkContext} from "@/contexts/CurrentNetwork";
import {TVmpxGlobalState} from "@/contexts/types";

const {publicRuntimeConfig: config} = getConfig();
const supportedNetworks = networks({config});

const NetworkPage = ({}: any) => {
  const { } = useContext(NotificationsContext);
  const {networkId} = useContext(CurrentNetworkContext);
  const {ready, initState, syncState, syncUser, mint, state} = useContext(Web3Context);
  const [loading, setLoading] = useState(false);

  const hasVmpx = networkId
    && supportedNetworks[networkId]?.contractAddress;

  const ethersInWei = BigInt('1000000000000000000');

  const vmpxIsActive = hasVmpx
    && typeof supportedNetworks[networkId].contractAddress === 'string'
    && isAddress(supportedNetworks[networkId].contractAddress?.toString() || '');

  const globalState: TVmpxGlobalState = state.globalState[networkId as any];

  useEffect(() => {
    console.log('index', ready, networkId);
    if (ready && networkId && vmpxIsActive) {
      initState(networkId)
        .then(_ => syncState(networkId))
        .then(_ => syncUser(networkId))
    }
  }, [ready, networkId, vmpxIsActive])

  useEffect(() => {
    console.log('globalState', globalState);
  }, [globalState])

  const doMint = async () => {
    setLoading(true);
    await mint();
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
      <Box>
        <Container sx={{textAlign: 'center' }}>
          <Typography
            sx={{
              maxWidth: '900px',
              margin: 'auto',
              fontFamily: 'Italiana',
              fontWeight: 'bold',
              marginBottom: 4,
            }}
            variant="h2" >
            VMPX
          </Typography>
          <Grid container sx={{ maxWidth: 400, justifyContent: 'center', margin: 'auto' }}>
            <Grid item xs={6} sx={{ textAlign: 'left' }}>Cap</Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>{((globalState?.cap || 0n) / ethersInWei).toLocaleString()}</Grid>
            <Grid item xs={6} sx={{ textAlign: 'left' }}>Minted</Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>{globalState?.totalSupply?.toLocaleString()}</Grid>
            <Grid item xs={12} sx={{ py: 4, mt: 4 }}>
              <LoadingButton
                size="large"
                color="error"
                sx={{
                  borderRadius: 25,
                  width: 150,
                  height: 60,
                  backgroundColor: '#650F10',
                  '&:hover': { backgroundColor: '#A41E14'}
                }}
                variant={loading ? "outlined" : "contained"}
                disableElevation
                loading={loading}
                loadingPosition="end"
                endIcon={<KeyboardArrowRightIcon/>}
                onClick={doMint} >
                {loading ? 'Dripping' : 'Drip'}
              </LoadingButton>
            </Grid>
          </Grid>
        </Container>
      </Box>
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
