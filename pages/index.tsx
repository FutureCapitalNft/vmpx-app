import getConfig from "next/config";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import React, { useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button, Stack
} from "@mui/material";

import {useRouter} from "next/router";
import {ThemeContext} from "@/contexts/Theme";
import {useAccount, useNetwork, useSwitchNetwork} from "wagmi";
import networks, {TNetworkConfig} from "@/config/networks";

const {publicRuntimeConfig} = getConfig();
const supportedNetworks = networks({ config: publicRuntimeConfig });

const HomePage = ({}: any) => {
  const { isLarge } = useContext(ThemeContext);
  const router = useRouter();
  const { chain } = useNetwork();
  const { address } = useAccount();

  const { switchNetwork } = useSwitchNetwork({
    onSuccess: (data) => {
      const targetNetwork = Object.values(supportedNetworks)
        .find(n => Number(n?.chainId) === chain?.id)
      // console.log(data)
      router.replace(`/${targetNetwork?.networkId}`)
        .catch(_ => {
          // Do nothing; should already be handled
        });
    }
  })

  const onNetworkClick = (networkId: string) => () => {
    const targetNetwork = Object.values(supportedNetworks)
      .find(n => n?.networkId === networkId)
    if (Number(targetNetwork?.chainId) === Number(chain?.id)) {
      router.replace(`/${targetNetwork?.networkId}`)
        .catch(_ => {
          // Do nothing; should already be handled
        });
    }
    if (switchNetwork) {
      switchNetwork(Number(targetNetwork?.chainId) || 1)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{`VMPX`}</title>
        <meta name="description"
              content="VMPX ERC-20 Token. Fair Launch and distribution"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh'}} >
      {Array(isLarge?100:30).fill(null).map((_, idx) => (<Box key={idx} className="circle-container">
        <Box className="circle"></Box>
      </Box>))}
      </Box>
      <Box>
        <Container sx={{textAlign: 'center'}}>
          <Typography sx={{
            maxWidth: '900px',
            fontFamily: 'Italiana',
            margin: 'auto',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }} variant="h5">
            Thirsty...? 🧛 Welcome to VMPX World!<br/>
            Hurry, mint yourself some, while it lasts...
          </Typography>
          {!!address && <Stack
            direction="column"
            sx={{ justifyContent: 'center' }} >
            {Object.values(supportedNetworks)
              .map((network: TNetworkConfig) => (<Button
                key={network.networkId}
                size="large"
                disabled={!address}
                color="success"
                variant="outlined"
                onClick={onNetworkClick(network?.networkId)}
                sx={{ borderRadius: 25, width: 300, height: 60, textTransform: 'unset', fontWeight: 'bold', margin: '1rem auto' }} >
              {'Mint VMPX on ' + network.name}
            </Button>))}
          </Stack>}
          {!address && <Box sx={{ mt: 5 }}>
              <Typography >
                Please Connect Wallet
              </Typography>
          </Box>}
        </Container>
      </Box>
    </div>
  )
}

export const getStaticProps = async () => {
  return {props: {}}
};

export default HomePage
