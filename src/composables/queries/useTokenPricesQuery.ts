import { reactive, ref, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { coingeckoService } from '@/services/coingecko/coingecko.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { sleep } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import useUserSettings from '@/composables/useUserSettings';
import { TOKENS } from '@/constants/tokens';
import useNetwork from '../useNetwork';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { getAddress } from '@ethersproject/address';

/**
 * TYPES
 */
type QueryResponse = TokenPrices;

/**
 * CONSTANTS
 */
const PER_PAGE = 1000;

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

  async function injectV2Prices(
    prices: TokenPrices,
    addresses: any
  ): Promise<TokenPrices> {
    const tokenForV2Query: string[] = addresses.value
      .filter((item: string) => !Object.keys(prices).includes(item))
      .map((el: string) => {
        return el.toLowerCase();
      });
      // TODO: Price for SYMMv2 on CELO
      tokenForV2Query.push('0x8427bd503dd3169ccc9aff7326c15258bc305478');
    const tokens = await balancerSubgraphService.tokens.get({
      where: {
        id_in: tokenForV2Query
      }
    });
    tokens.map(t => {
      // const symmPrice = subgraphRes?.tokenPrices[0].price;
      const tPrice = t.latestPrice ? t.latestPrice.price : 0;
      prices[getAddress(t.id)] = {
        [currency.value]: Number((+tPrice).toFixed(6))
      };
    });
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
        ...(await coingeckoService.prices.getTokens(pageAddresses))
      };
    }

    prices = injectWstEth(prices);
    prices = await injectV2Prices(prices, addresses);
    return prices;
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
