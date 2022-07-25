import { reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';

import QUERY_KEYS from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';

import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import useNetwork from '../useNetwork';

type QueryResponse = {
  tokens: any;
  skip?: number;
};

export default function useSymmetricQueries(
  ids: any,
  options: UseInfiniteQueryOptions<QueryResponse> = {}
) {
  // COMPOSABLES
  const { networkId } = useNetwork();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Tokens.Prices(networkId, ids));

  // METHODS
  const queryFn = async ({ pageParam = 0 }) => {
    const tokens = await balancerSubgraphService.tokens.get({
      first: POOLS.Pagination.PerPage,
      skip: pageParam,
      where: {
        id_in: ids
      }
    });
    console.log('Calling V2 Query');
    return {
      tokens
    };
  };

  const queryOptions = reactive({
    getNextPageParam: (lastPage: QueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
