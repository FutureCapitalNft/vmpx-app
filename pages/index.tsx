import getConfig from "next/config";
import networks from "../config/networks";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid, Button
} from "@mui/material";
// import {NotificationsContext} from "@/contexts/Notifications";
// import {CurrentNetworkContext} from "@/contexts/CurrentNetwork";
import Link from "next/link";
import {WalletContext} from "@/contexts/Wallet";
import {useRouter} from "next/router";
const {publicRuntimeConfig: config} = getConfig();
// const supportedNetworks = networks({config});

const HomePage = ({}: any) => {
  const { requestNetwork } = useContext(WalletContext);
  const router = useRouter();

  const onNetworkClick = (networkId: string) => () => {
    requestNetwork(networkId)
      .then(_ => router.replace(`/${networkId}`))
      .catch(_ => {
        // Do nothing; should already be handled
      });
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
        <Container sx={{textAlign: 'center'}}>
          <Typography sx={{
            maxWidth: '900px',
            margin: 'auto',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }} variant="h5">
            Welcome to VMPX World
          </Typography>
            <Button
              color="success"
              variant="outlined"
              onClick={onNetworkClick('x1')}
              sx={{ borderRadius: 25}} >
              Drip VMPX on X1
            </Button>
        </Container>
      </Box>
    </div>
  )
}

export const getStaticProps = async () => {
  return {props: {}}
};

export default HomePage
