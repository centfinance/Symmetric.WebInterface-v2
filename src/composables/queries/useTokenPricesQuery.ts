import { reactive, ref, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
// import { coingeckoService } from '@/services/coingecko/coingecko.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { sleep } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import useUserSettings from '@/composables/useUserSettings';
import { TOKENS } from '@/constants/tokens';
import useNetwork from '../useNetwork';
import { subgraphRequest } from '@/lib/utils/subgraph';
import useSymmetricQueries from '@/composables/queries/useSymmetricQueries.json';
import { request } from 'graphql-request';
import { Network } from '@symmetric-v2/sdk';
import { tokenPriceQuery } from '@/composables/queries/useSymmetricQueries';

/**
 * TYPES
 */
type QueryResponse = TokenPrices;

/**
 * CONSTANTS
 */
const PER_PAGE = 1000;

// @ts-ignore TYPE NEEDS FIXING
export async function pager(endpoint, query, variables = {}) {
  if (endpoint.includes('undefined')) return {};

  const data: any = {};
  let skip = 0;
  let flag = true;

  while (flag) {
    flag = false;
    const req = await request(endpoint, query, variables);

    Object.keys(req).forEach(key => {
      data[key] = data[key] ? [...data[key], ...req[key]] : req[key];
    });

    Object.values(req).forEach((entry: any) => {
      if (entry.length === 1000) flag = true;
    });

    // @ts-ignore TYPE NEEDS FIXING
    if (
      Object.keys(variables).includes('first') &&
      variables['first'] !== undefined
    )
      break;

    skip += 1000;
    variables = { ...variables, skip };
  }
  return data;
}

// @ts-ignore TYPE NEEDS FIXING
export const getTokenPriceFromSymmV1 = async (
  chainId = Network.CELO,
  query,
  variables
) =>
  pager(
    // @ts-ignore TYPE NEEDS FIXING
    `https://api.thegraph.com/subgraphs/name/centfinance/${
      chainId === Network.CELO ? 'symmetric-celo' : 'symmetricv1gnosis'
    }`,
    query,
    variables
  );

export const getTokenPrice = async (
  chainId = Network.CELO,
  query,
  variables
) => {
  const { tokenPrices } = await getTokenPriceFromSymmV1(
    chainId,
    query,
    variables
  );
  return tokenPrices[0]?.price;
};

const getTokens = async (addresses, chainId, currency) => {
  const prices = await Promise.all(
    addresses.map(async address => {
      let price = 0;
      try {
        price = await getTokenPrice(chainId, tokenPriceQuery, {
          id: address.toLowerCase()
        });
      } catch (e) {
        // console.log(e)
      }
      return {
        [address]: { [currency]: Number((+price).toFixed(6)) }
      };
    })
  );

  let res = {};

  // convert array to object
  prices.forEach(price => {
    const id = Object.keys(price)[0];
    if (price[id].usd) {
      res = { ...res, ...price };
    }
  });
  console.log(res);
  return res;
};

/**
 * Fetches token prices for all provided addresses.
 */
export default function useTokenPricesQuery(
  addresses: Ref<string[]> = ref([]),
  options: UseQueryOptions<QueryResponse> = {}
) {
  const { networkId } = useNetwork();
  const queryKey = reactive(QUERY_KEYS.Tokens.Prices(networkId, addresses));
  const { currency } = useUserSettings();

  // TODO: kill this with fire as soon as Coingecko supports symmv2
  async function injectSymmV2PriceOnCelo(
    prices: TokenPrices
  ): Promise<TokenPrices> {
    // get SYMM price from v1 subgraph
    const symm2address = '0x8427bD503dd3169cCC9aFF7326c15258Bc305478';
    const url =
      'https://api.thegraph.com/subgraphs/name/centfinance/symmetricv1celo';
    const subgraphRes = await subgraphRequest(
      url,
      useSymmetricQueries['getSYMM2PriceCELO']
    );
    const symmPrice = subgraphRes?.tokenPrices[0].price;
    prices[symm2address] = {
      [currency.value]: Number((+symmPrice).toFixed(6))
    };
    return prices;
  }

  // TODO: kill this with fire as soon as Coingecko supports wstETH
  function injectWstEth(prices: TokenPrices): TokenPrices {
    const stEthAddress = configService.network.addresses.stETH;
    const wstEthAddress = configService.network.addresses.wstETH;
    if (prices[stEthAddress]) {
      const stETHPrice = prices[stEthAddress][currency.value] || 0;
      prices[wstEthAddress] = {
        [currency.value]: TOKENS.Prices.ExchangeRates.wstETH.stETH * stETHPrice
      };
    }

    return prices;
  }

  const queryFn = async () => {
    // Sequential pagination required to avoid coingecko rate limits.
    let prices: TokenPrices = {};
    const pageCount = Math.ceil(addresses.value.length / PER_PAGE);
    const pages = Array.from(Array(pageCount).keys());

    for (const page of pages) {
      if (page !== 0) await sleep(1000);
      const pageAddresses = addresses.value.slice(
        PER_PAGE * page,
        PER_PAGE * (page + 1)
      );
      console.log('Fetching', pageAddresses.length, 'prices');
      prices = {
        ...prices,
        // ...(await coingeckoService.prices.getTokens(pageAddresses)),
        ...(await getTokens(pageAddresses, networkId, currency.value))
      };
    }

    prices = injectWstEth(prices);
    prices = await injectSymmV2PriceOnCelo(prices);
    return prices;
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
