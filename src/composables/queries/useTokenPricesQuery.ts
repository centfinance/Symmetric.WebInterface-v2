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
import { subgraphRequest } from '@/lib/utils/subgraph';
import useSymmetricQueries from '@/composables/queries/useSymmetricQueries.json';

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

  // TODO: kill this with fire as soon as Coingecko supports symmv2
  async function injectSymmV2PriceOnCelo(
    prices: TokenPrices
  ): Promise<TokenPrices> {
    // get SYMM price from v1 subgraph
    const symm2address = '0x8427bD503dd3169cCC9aFF7326c15258Bc305478';
    const url =
      'https://api.thegraph.com/subgraphs/name/centfinance/symmetric-v2-celo';
    const subgraphRes = await subgraphRequest(
      url,
      useSymmetricQueries['getSYMM2PriceCELOV2']
    );
    const symmPrice = subgraphRes?.tokens[0]?.latestPrice?.price;
    prices[symm2address] = {
      [currency.value]: Number((+symmPrice).toFixed(6))
    };
    return prices;
  }

  // TODO: kill this with fire as soon as Coingecko supports symmv2
  async function injectEthixPriceOnCelo(
    prices: TokenPrices
  ): Promise<TokenPrices> {
    const Ethix_address = '0x9995cc8F20Db5896943Afc8eE0ba463259c931ed';
    const url =
      'https://api.thegraph.com/subgraphs/name/centfinance/symmetric-v2-celo';
    const subgraphRes = await subgraphRequest(
      url,
      useSymmetricQueries['getEthixPriceCELOV2']
    );
    const ethixPrice = subgraphRes?.tokens[0]?.latestPrice?.price;
    prices[Ethix_address] = {
      [currency.value]: Number((+ethixPrice).toFixed(6))
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
        ...(await coingeckoService.prices.getTokens(pageAddresses))
      };
    }

    prices = injectWstEth(prices);
    prices = await injectSymmV2PriceOnCelo(prices);
    prices = await injectEthixPriceOnCelo(prices);
    return prices;
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
