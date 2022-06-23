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
import usecREALQueries from '@/composables/queries/usecREALQueries.json';
import usemcREALQueries from '@/composables/queries/usemcREALQueries.json';
import usecDEFIQueries from '@/composables/queries/usemcDEFIQueries.json';
import usecDEFISharesQueries from '@/composables/queries/usecDEFISharesQueries.json';

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

  // TODO: kill this with fire as soon as Coingecko supports symmv2
  async function injectcREALPriceOnCelo(
    prices: TokenPrices
  ): Promise<TokenPrices> {
    // get SYMM price from v1 subgraph
    const symm2address = '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787';
    const url =
      'https://api.thegraph.com/subgraphs/name/centfinance/symmetricv1celo';
    const subgraphRes = await subgraphRequest(
      url,
      usecREALQueries['getCREALPriceCELO']
    );
    const symmPrice = subgraphRes?.tokenPrices[0].price;
    prices[symm2address] = {
      [currency.value]: Number((+symmPrice).toFixed(6))
    };
    return prices;
  }

  async function injectmcREALPriceOnCelo(
    prices: TokenPrices
  ): Promise<TokenPrices> {
    // get SYMM price from v1 subgraph
    const symm2address = '0x9802d866fdE4563d088a6619F7CeF82C0B991A55';
    const url =
      'https://api.thegraph.com/subgraphs/name/centfinance/symmetricv1celo';
    const subgraphRes = await subgraphRequest(
      url,
      usemcREALQueries['getMCREALPriceCELO']
    );
    const symmPrice = subgraphRes?.tokenPrices[0].price;
    prices[symm2address] = {
      [currency.value]: Number((+symmPrice).toFixed(6))
    };
    return prices;
  }

  async function injectcDEFIPriceOnCelo(
    prices: TokenPrices
  ): Promise<TokenPrices> {
    if (
      prices['0x8427bD503dd3169cCC9aFF7326c15258Bc305478'] != undefined &&
      prices['0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B'] != undefined &&
      prices['0x17700282592D6917F6A73D0bF8AcCf4D578c131e'] != undefined &&
      prices['0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC'] != undefined
    ) {
      const SYMMv2Price =
        prices['0x8427bD503dd3169cCC9aFF7326c15258Bc305478'][currency.value] ||
        0;
      const MOBIPrice =
        prices['0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B'][currency.value] ||
        0;
      const MOOPrice =
        prices['0x17700282592D6917F6A73D0bF8AcCf4D578c131e'][currency.value] ||
        0;
      const UBEPrice =
        prices['0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC'][currency.value] ||
        0;

      const symm2address = '0xa287a3722c367849efa5c76e96be36efd65c290e';
      const url =
        'https://api.thegraph.com/subgraphs/name/centfinance/symmetric-v2-celo';
      const subgraphRes = await subgraphRequest(
        url,
        usecDEFIQueries['getCDEFIBalanceCELO']
      );

      const subgraphResShares = await subgraphRequest(
        url,
        usecDEFISharesQueries['getCDEFISharesCELO']
      );

      const UBEBalance = subgraphRes?.poolTokens[0].balance;
      const MOOBalance = subgraphRes?.poolTokens[1].balance;
      const MOBIBalance = subgraphRes?.poolTokens[2].balance;
      const SYMMBalance = subgraphRes?.poolTokens[3].balance;
      const cDEFIPrice =
        (UBEPrice * UBEBalance +
          MOOBalance * MOOPrice +
          MOBIBalance * MOBIPrice +
          SYMMv2Price * SYMMBalance) /
        subgraphResShares?.pools[0].totalShares;

      prices[symm2address] = {
        [currency.value]: Number((+cDEFIPrice).toFixed(6))
      };
    }
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
    prices = await injectcREALPriceOnCelo(prices);
    prices = await injectmcREALPriceOnCelo(prices);
    prices = await injectcDEFIPriceOnCelo(prices);
    return prices;
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
