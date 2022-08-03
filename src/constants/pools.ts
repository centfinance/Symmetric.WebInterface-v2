export const POOLS = {
  Pagination: {
    PerPage: 10
  },
  DelegateOwner: '0x2088DAdbd1D068b8A80894A4bb56BCD575c4AfFD',
  gnosisDelegateOwner: '0x689cC0Ea1140546a8a7985315E9C8fef7e0461bc',
  kavaDelegateOwner: '0x71ee4bed4f30199ef34f1926bae5548ba7f7430e',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063'
    ]
  },
  BlockList: [''],
  ExcludedPoolTypes: ['Element', 'AaveLinear', 'Linear'],
  Stable: {
    AllowList: [
      '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
      '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
      '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8' // kovan bb-a-USD
    ]
  },
  Investment: {
    AllowList: [
      '0x4fd63966879300cafafbb35d157dc5229278ed23000100000000000000000169', // kovan
      '0x37a6fc079cad790e556baedda879358e076ef1b3000100000000000000000348', // WSB Kovan
      '0xccf5575570fac94cec733a58ff91bb3d073085c70002000000000000000000af', // iROBOT mainnet
      '0xe7b1d394f3b40abeaa0b64a545dbcf89da1ecb3f00010000000000000000009a', // Techemy mainnet
      '0x3b40d7d5ae25df2561944dd68b252016c4c7b2800001000000000000000000c2' // WSB-DEFI mainnet
    ]
  },
  Factories: {
    '0xa5bf2ddf098bb0ef6d120c98217dd6b141c74ee0': 'oracleWeightedPool',
    '0xb13A501fA658389e437E3047d56F2Bf945207a5A': 'weightedPool', // Gnosis
    '0xF9e6BE5A015Da5dc29B42ff345bB7Dd1b6C60aC7': 'stablePool', // Gnosis
    '0xe5c968e57AD90017eBd3080cE7A4f86F85C5Bc8a': 'liquidityBootstrappingPool', // Gnosis LBP
    '0x47B7bdA16AB8B617E976c83A2c3c8664944d8Ed2': 'weightedPool', // Celo
    '0x7dF194500b8b8dcFe6A0b8E412f8a166c89Bf255': 'stablePool', // Celo
    '0xe007Ba1c5665567175B4d462f8dba14506e7f592': 'liquidityBootstrappingPool', // Celo LBP
    '0x0a0717A8A0641eA3C4eB82Aa9D82F07Ad887750b': 'weightedPool', // Kava
    '0x8628Ab9f1E7113abC29fDc05c9c37d9B8FcEb4e9': 'stablePool', // Kava
    '0x3a62327c3C05606De1Bf48226ac5f20E109bA16B': 'liquidityBootstrappingPool', // Kava LBP
    '0x67d27634e44793fe63c467035e31ea8635117cd4': 'stablePool', // Metastable
    '0x751dfdace1ad995ff13c927f6f761c6604532c79': 'stablePool', // Kovan
    '0x590e544e7ca956bb878f8c873e82e65550d67d2f': 'stablePool', // Kovan Metastable
    // '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'managedPool', // Kovan Managed (clash with mainnet StablePhantom address)
    '0x7dfdef5f355096603419239ce743bfaf1120312b': 'weightedPool', // Arbitrum Weighted
    '0xcf0a32bbef8f064969f21f7e02328fb577382018': 'weightedPool', // Arbitrum WeightedOracle
    '0x2433477a10fc5d31b9513c638f19ee85caed53fd': 'stablePool', // Arbitrum Stable
    '0xebfd5681977e38af65a7487dc70b8221d089ccad': 'stablePool', // Arbitrum MetaStable
    '0x751a0bc0e3f75b38e01cf25bfce7ff36de1c87de': 'liquidityBootstrappingPool', // Mainnet LBP
    '0x0f3e0c4218b7b0108a3643cfe9d3ec0d4f57c54e': 'liquidityBootstrappingPool', // Mainnet LBP (zero protocol fee)
    '0x48767f9f868a4a7b86a90736632f6e44c2df7fa9': 'managedPool', // Mainnet Managed
    '0x0f7bb7ce7b6ed9366f9b6b910adefe72dc538193': 'managedPool', // Polygon Managed
    '0xacd615b3705b9c880e4e7293f1030b34e57b4c1c': 'managedPool', // arbitrum managed
    '0xb08e16cfc07c684daa2f93c70323badb2a6cbfd2': 'boostedPool', // mainnet stablephantom
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'boostedPool', // arbitrum stablephantom
    '0xc128a9954e6c874ea3d62ce62b468ba073093f25': 'boostedPool', // polygon stablephantom
    '0x6c7f4d97269ece163fd08d5c2584a21e4a33934c': 'boostedPool' // kovan stablephantom
  }
};
