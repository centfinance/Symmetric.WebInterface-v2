import { reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';

import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';

import { balancerSubgraphFarmService } from '@/services/balancer/subgraph/balancer-subgraph-farms.service';
import { Farm } from '@/services/balancer/subgraph/types';
import useNetwork from '../useNetwork';

type FarmsQueryResponse = {
  pools: Farm[];
  skip?: number;
};

export default function useFarmsQuery(
  pair: string,
  options: UseInfiniteQueryOptions<FarmsQueryResponse> = {}
) {
  // COMPOSABLES
  const { networkId } = useNetwork();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Farms.Farms(networkId, pair));

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const pools = await balancerSubgraphFarmService.farms.get({
      first: POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        pair: pair
      }
    });

    return {
      pools
    };
  };

  const queryOptions = reactive({
    getNextPageParam: (lastPage: FarmsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<FarmsQueryResponse>(queryKey, queryFn, queryOptions);
}
