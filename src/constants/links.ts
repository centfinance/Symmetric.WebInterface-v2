export const EXTERNAL_LINKS = {
  Balancer: {
    Home: 'https://symmetric.finance',
    BalForGas:
      'https://docs.balancer.finance/core-concepts/bal-balancer-governance-token/bal-for-gas',
    PoolsV1Dashboard: 'https://celo-pools.symmetric.exchange/#/',
    PoolsV1Explore: 'https://celo-pools.symmetric.exchange/#/explore'
  },
  Gauntlet: {
    Home: 'https://gauntlet.network'
  },
  Ethereum: {
    Wallets: 'https://docs.celo.org/getting-started/wallets'
  },
  Element: {
    Earn: 'https://app.element.fi/earn',
    Pools: {
      LUSD:
        'https://app.element.fi/pools/0xA8D4433BAdAa1A35506804B43657B0694deA928d',
      USDC:
        'https://app.element.fi/pools/0x787546Bf2c05e3e19e2b6BDE57A203da7f682efF'
    }
  },
  Symmetric: {
    Help: 'https://symmetric.finance/#1539145981313-cd966911-eaaf',
    Medium:
      'https://medium.com/@Symmetric.Finance/whats-coming-with-symmetric-v2-b168b3830989',
    PrimeDaoMedium:
      'https://medium.com/@Symmetric.Finance/announcing-the-symmetric-primedao-partnership-e8557301145b'
  },
  Copper: {
    Auctions: (poolAddress: string, networkPrefix = '') =>
      `https://${networkPrefix}copperlaunch.com/auctions/${poolAddress}`
  }
};
