import { configService } from '@/services/config/config.service';
import { BalancerSDK, Network } from '@symmetric-v2/sdk';

const network = ((): Network => {
  switch (configService.network.key) {
    case '1':
      return Network.MAINNET;
    case '42':
      return Network.KOVAN;
    case '137':
      return Network.POLYGON;
    case '42161':
      return Network.ARBITRUM;
    case '42220':
      return Network.CELO;
    case '100':
      return Network.GNOSIS;
    default:
      return Network.MAINNET;
  }
})();

export const balancer = new BalancerSDK({
  network,
  rpcUrl: configService.rpc,
  subgraphUrl: configService.network.subgraph
});
