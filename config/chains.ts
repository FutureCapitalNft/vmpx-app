import getConfig from 'next/config';
import {
  goerli,
  mainnet,
} from 'wagmi/chains';
import { x1Devnet } from './chains/x1Devnet';
import networks from './networks';

const chains = [
  // mainnets
  mainnet,
  // testnets
  // goerli,
  // devnets
  // x1Devnet,
  // x1Fastnet
];

const { publicRuntimeConfig } = getConfig();

const { isTestnet } = publicRuntimeConfig;

const supportedNetworks = networks({ config: publicRuntimeConfig });
const supportedChainIds = Object.values(supportedNetworks)
  .filter(n => n.isTestnet === (isTestnet === 1))
  .map(n => Number(n.chainId));

export const supportedChains = chains.filter(chain => supportedChainIds.includes(chain?.id));
