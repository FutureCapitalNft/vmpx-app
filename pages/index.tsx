import getConfig from "next/config";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import React, { useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button
} from "@mui/material";

import {useRouter} from "next/router";
import {ThemeContext} from "@/contexts/Theme";
import {useNetwork, useSwitchNetwork} from "wagmi";
import networks from "@/config/networks";

const {publicRuntimeConfig} = getConfig();
const supportedNetworks = networks({ config: publicRuntimeConfig });


const HomePage = ({}: any) => {
  const { isLarge } = useContext(ThemeContext);
  const router = useRouter();
  const { chain } = useNetwork();

  const { switchNetwork } = useSwitchNetwork({
    onSuccess: (data) => {
      const targetNetwork = Object.values(supportedNetworks)
        .find(n => Number(n?.chainId) === chain?.id)
      console.log(data)
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
            <Button
              size="large"
              color="success"
              variant="outlined"
              onClick={onNetworkClick('x1')}
              sx={{ borderRadius: 25, mt: 4 , width: 250, height: 60, textTransform: 'unset', fontWeight: 'bold' }} >
              Mint VMPX on X1
            </Button>
          {/*<Button
            size="large"
            color="success"
            variant="outlined"
            onClick={onNetworkClick('goerli')}
            sx={{ borderRadius: 25, mt: 4 , width: 250, height: 60, textTransform: 'unset', fontWeight: 'bold' }} >
            Mint VMPX on Goerli
          </Button>*/}
        </Container>
      </Box>
    </div>
  )
}

export const getStaticProps = async () => {
  return {props: {}}
};

export default HomePage
