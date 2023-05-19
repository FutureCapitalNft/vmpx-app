import {Select, SelectChangeEvent, MenuItem, Box, FormControl, ListItemText, ListItemIcon} from "@mui/material";
import {useContext, useEffect, useState} from "react";
import getConfig from "next/config";
import networks from "../config/networks";
import {useRouter} from "next/router";
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {WalletContext} from "@/contexts/Wallet";
import {ThemeContext} from "@/contexts/Theme";
import {CurrentNetworkContext} from "@/contexts/CurrentNetwork";
import {NetworkContext} from "@/contexts/Network";

const { publicRuntimeConfig } = getConfig();

if (publicRuntimeConfig.nodeEnv === 'development') {
  // supportedNetworks.push({ label: 'Local', value: 'http://localhost:3000' },)
}

const SelectNetworkButton = () => {
  const router = useRouter();
  const { isLarge } = useContext(ThemeContext);
  const { networkId } = useContext(CurrentNetworkContext);
  const { helper } = useContext(NetworkContext);
  const { walletNetworkId, requestNetwork, wallet } = useContext(WalletContext);

  const label = (l: string) => isLarge ? l : l.replace('Testnet', '').trim();

  const currentNetworks = networks({ config: publicRuntimeConfig });
  const supportedNetworks = Object.entries(currentNetworks)
    .map(([k,v]: [string, any]) => ({ label: v.name, value: k, network: v }))
  const current = supportedNetworks
    .find(n => n.value === networkId || n.value === walletNetworkId);
  const defaultNetworkName = currentNetworks[publicRuntimeConfig.defaultNetworkId]?.name || 'Ethereum';
  const [network, setNetwork] = useState(current);

  useEffect(() => {
    const net = supportedNetworks
      .find(n => n.value === networkId || n.value === walletNetworkId);
    setNetwork(net);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkId, walletNetworkId, router.asPath])

  const handleChange = (event: SelectChangeEvent<any>) => {
    const newNetworkId = event.target?.value?.networkId;
    console.log('button req', networkId, '>', newNetworkId)
    requestNetwork(newNetworkId);
  };

  return (
    <Box sx={{ marginRight: '8px' }}>
      <FormControl fullWidth size="small" >
        <Select role="navigation"
                fullWidth
                IconComponent={ArrowDownIcon}
                renderValue={(n) => <MenuItem color={publicRuntimeConfig.isTestnet ? 'warning': 'primary'}>
                  {label(n?.name || defaultNetworkName)}
                </MenuItem>}
                onChange={handleChange}
                color={publicRuntimeConfig.isTestnet ? 'warning': 'primary'}
                value={network?.network || { label: defaultNetworkName}}
                sx={{borderRadius: 25, maxHeight: '40px', }}>
          {supportedNetworks
            .map((n: any) => <MenuItem key={n.label}
                                       value={n.network}
                                       color={publicRuntimeConfig.isTestnet ? 'warning': 'primary'} >
              <ListItemIcon>{n.network.icon}</ListItemIcon>
              <ListItemText>{n.label}</ListItemText>
          </MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  )
}

export default SelectNetworkButton
