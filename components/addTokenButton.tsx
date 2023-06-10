import {IconButton, Tooltip} from "@mui/material";
import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";
import {useWalletClient} from "wagmi";

const AddTokenButton = ({ type = 'VMPX', address, image, tokenType = 'ERC20' }: any) => {
  const { data: wallet } = useWalletClient();
  const onAddTokenClick = () => {
    const imageUrl = image.startsWith('http') || image.startsWith('/')
      ? image
      : `https://xen.network/XEN-logo-square-dark-512x512.png`
    console.log('add', type, address, imageUrl)
    if (address && image) {
      wallet?.watchAsset({
        type: tokenType,
        options: {
          address,
          symbol: type,
          decimals: 18,
          image
        }
      }).then(_ => {
        console.log('success')
      }).catch(_ => {
        console.log('error')
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
      <ControlPointDuplicateIcon />
      </IconButton>
    </Tooltip>
  )
}

export default AddTokenButton;
