import getConfig from "next/config";
import networks from "../config/networks";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid
} from "@mui/material";
import {NotificationsContext} from "@/contexts/Notifications";
import {Web3Context} from "@/contexts/Web3";
import {CurrentNetworkContext} from "@/contexts/CurrentNetwork";
const {publicRuntimeConfig: config} = getConfig();
const supportedNetworks = networks({config});

const HomePage = ({}: any) => {
  const { } = useContext(NotificationsContext);
  const {networkId} = useContext(CurrentNetworkContext);
  const {ready, initState, syncState, syncUser} = useContext(Web3Context);

  useEffect(() => {
    console.log('index', ready, networkId);
    if (ready && networkId) {
      initState()
        .then(_ => syncState())
        .then(_ => syncUser())
    }
  }, [ready, networkId])

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
            Explore XEN Universe
          </Typography>
          <Box>
            VMPX
          </Box>
        </Container>
      </Box>
    </div>
  )
}

export const getStaticProps = async () => {
  return {props: {}}
};

export default HomePage
