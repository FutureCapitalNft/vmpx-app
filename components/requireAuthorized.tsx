import {Box, Container, Typography} from "@mui/material";
import {useContext} from "react";
import ConnectWalletButton from "./connectWalletButton";
import {WalletContext} from "@/contexts/Wallet";
import {Web3Context} from "@/contexts/Web3";

const RequireAuthorized = ({ children }: any) => {
  const { wallet, accounts } = useContext(WalletContext);
  const {  } = useContext(Web3Context);
  if (!wallet || !accounts || accounts.length === 0) {
    return (
      <Box>
        <Container sx={{textAlign: 'center'}}>
          <Typography variant="body1" sx={{m: 2}}>
              Please connect Web3 wallet to interact with VMPX world
          </Typography>
          <ConnectWalletButton />
        </Container>
      </Box>
    )
  } else {
    return (<>{children}</>)
  }
}

export default RequireAuthorized
