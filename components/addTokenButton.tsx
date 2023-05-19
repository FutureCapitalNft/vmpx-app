import {IconButton, Tooltip} from "@mui/material";
import {useContext} from "react";
import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";
import {WalletContext} from "../contexts/Wallet";

const AddTokenButton = ({ type = 'XEN', address, image, tokenType = 'ERC20' }: any) => {
  const { addToken } = useContext(WalletContext);
  const onAddTokenClick = () => {
    const imageUrl = image.startsWith('http')
      ? image
      : `https://xen.network/XEN-logo-square-dark-512x512.png`
    console.log('add', type, address, imageUrl)
    if (address && image) {
      addToken(address, imageUrl, type)
        .then(() => {
          // nothing
        })
    }
  }
  // const tooltip = 'ERC-721 tokens are added as ERC-20 until MetaMask supports it natively'

  return (
    <Tooltip title={`Add ${type} to wallet`}>
      <IconButton
            size="small"
            onClick={onAddTokenClick}
            sx={{ borderRadius: 25, textTransform: 'unset' }} >
      <ControlPointDuplicateIcon style={{ color: 'grey' }} />
      </IconButton>
    </Tooltip>
  )
}

export default AddTokenButton;
