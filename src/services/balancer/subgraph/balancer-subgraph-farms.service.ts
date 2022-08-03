import { balancerSubgraphFarmClient } from './balancer-subgraph-farms.client';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import { Network, networkId } from '@/composables/useNetwork';
import Farms from './entities/Farms';

export default class BalancerSubgraphFarmService {
  farms: Farms;

  constructor(
    readonly client = balancerSubgraphFarmClient,
    readonly rpcProviderService = _rpcProviderService
  ) {
    // Init entities
    this.farms = new Farms(this);
  }

  public get blockTime(): number {
    switch (networkId.value) {
      case Network.MAINNET:
        return 13;
      case Network.POLYGON:
        return 2;
      case Network.ARBITRUM:
        return 3;
      case Network.KOVAN:
        // Should be ~4s but this causes subgraph to return with unindexed block error.
        return 1;
      case Network.CELO:
        return 5;
      case Network.KAVA:
        return 5;
      case Network.GNOSIS:
        return 5;
      default:
        return 13;
    }
  }
}

export const balancerSubgraphFarmService = new BalancerSubgraphFarmService();
