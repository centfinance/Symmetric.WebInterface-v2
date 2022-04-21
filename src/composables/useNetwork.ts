import { ref } from 'vue';

/**
 * TYPES
 */
export enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  GNOSIS = 100,
  POLYGON = 137,
  ARBITRUM = 42161,
  CELO = 42220
}

/**
 * STATE
 */
const DEFAULT_NETWORK_ID =
  process.env.VUE_APP_NETWORK != null
    ? (Number(process.env.VUE_APP_NETWORK) as Network)
    : Network.CELO;

export const networkId = ref<Network>(DEFAULT_NETWORK_ID);

export const isMainnet = networkId.value === Network.MAINNET;
export const isPolygon = networkId.value === Network.POLYGON;
export const isArbitrum = networkId.value === Network.ARBITRUM;
export const isCelo = networkId.value === Network.CELO;
export const isGnosis = networkId.value === Network.GNOSIS;

/**
 * METHODS
 */
export function setNetworkId(id: Network) {
  networkId.value = id;
}

export default function useNetwork() {
  return {
    setNetworkId,
    networkId
  };
}
