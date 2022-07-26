<script setup lang="ts">
import { toRef, computed } from 'vue';
import useWithdrawMath from '@/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath';
import { FullPool, Farm } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import { bnum } from '@/lib/utils';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import { lpTokensFor } from '@/composables/usePool';
import { getAddress, isAddress } from '@ethersproject/address';
import { Price } from '@balancer-labs/sor/dist/types';

/**
 * TYPES
 */
type Props = {
  farm: any;
  pool: FullPool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
// const { hasBpt } = useWithdrawMath(toRef(props, 'pool'));
const { balanceFor, nativeAsset, wrappedNativeAsset, getTokens } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { isWalletReady, toggleWalletSelectModal } = useWeb3();
const averageBlockTime = 5; // TBD for CELO & GNOSIS is fine, if anyother network then change
const blocksPerDay = 86400 / Number(averageBlockTime);
let tokenRewards: { [address: string]: { rewardsPerDay: string } };
/**
 * COMPUTED
 */
// const fiatTotal = computed((tokenAmount, tokenAddress) => {
//   const fiatValue = toFiat(tokenAmount, tokenAddress);
//   return fNum(fiatValue, currency.value);
// });

const rewardAPR = computed(() => {
  console.log('CALCULATING POOL APR');
  console.log(props.pool);
  const sharePrice =
    Number(props.pool?.totalLiquidity) / Number(props.pool?.totalShares);
  const tvl =
    sharePrice * props.farm.pools[0].slpBalance * 0.000000000000000001;
  const feeApyPerYear = Number(props.pool.dynamic.apr.total) * 100;

  // const feeApyPerMonth = feeApyPerYear / 12
  // const feeApyPerDay = feeApyPerMonth / 30
  // const feeApyPerHour = feeApyPerDay / (blocksPerDay/24)
  console.log('feeApyPerYear', feeApyPerYear);
  const symmPerSecond =
    ((props.farm.pools[0].allocPoint /
      props.farm.pools[0].symmChef.totalAllocPoint) *
      props.farm.pools[0].symmChef.symmPerSecond) /
    1e18;
  const symmPerBlock = symmPerSecond * averageBlockTime;
  const symmPerDay = symmPerBlock * blocksPerDay;
  const rewardAprPerYearToken1 =
    ((Number(toFiat(1, getAddress(props.farm.pools[0].symmChef.symm))) *
      symmPerDay *
      365) /
      tvl) *
    100;
  console.log('rewardAprPerYearToken1', rewardAprPerYearToken1);

  let rewardAprPerYearToken2 = 0;
  if (props.farm.pools[0].rewarder !== null) {
    const rPerSecond =
      props.farm.pools[0].rewarder.id ===
      '0xed803f7035749de7ae59b4e70af54111ec61d256'
        ? (((props.farm.pools[0].rewarderAllocPoint - 100) /
            props.farm.pools[0].rewarder.totalAllocPoint) *
            props.farm.pools[0].rewarder.rewardPerSecond) /
          1e18
        : ((props.farm.pools[0].rewarderAllocPoint /
            props.farm.pools[0].rewarder.totalAllocPoint) *
            props.farm.pools[0].rewarder.rewardPerSecond) /
          1e18;
    const rPerBlock = rPerSecond * averageBlockTime;
    const rPerDay = rPerBlock * blocksPerDay;

    rewardAprPerYearToken2 =
      ((Number(
        toFiat(1, getAddress(props.farm.pools[0].rewarder.rewardToken))
      ) *
        Number(rPerDay) *
        365) /
        tvl) *
      100;
    console.log('rewardAprPerYearToken2', rewardAprPerYearToken2);
  }
  const roiPerYear =
    rewardAprPerYearToken1 + rewardAprPerYearToken2 + feeApyPerYear;

  return fNum(roiPerYear);
  // console.log(rewardAprPerYearToken1)
  // return 244;
});

const symmPerDay = computed(() => {
  const symmPerSecond =
    ((props.farm.pools[0].allocPoint /
      props.farm.pools[0].symmChef.totalAllocPoint) *
      props.farm.pools[0].symmChef.symmPerSecond) /
    1e18;
  const symmPerBlock = symmPerSecond * averageBlockTime;
  const symmPerDay = symmPerBlock * blocksPerDay;
  return symmPerDay.toFixed(4);
});

const rewardTokens = computed((): {
  [address: string]: { rewardsPerDay: string; tokenAddress: string };
} => {
  const token1Address = getAddress(props.farm.pools[0].symmChef.symm);
  let rTokens: {
    [address: string]: { rewardsPerDay: string; tokenAddress: string };
  } = {};
  rTokens[token1Address] = {
    rewardsPerDay: symmPerDay.value,
    tokenAddress: token1Address
  };
  if (props.farm.pools[0].rewarder !== null) {
    const rPerSecond =
      props.farm.pools[0].rewarder.id ===
      '0xed803f7035749de7ae59b4e70af54111ec61d256'
        ? (((props.farm.pools[0].rewarderAllocPoint - 100) /
            props.farm.pools[0].rewarder.totalAllocPoint) *
            props.farm.pools[0].rewarder.rewardPerSecond) /
          1e18
        : ((props.farm.pools[0].rewarderAllocPoint /
            props.farm.pools[0].rewarder.totalAllocPoint) *
            props.farm.pools[0].rewarder.rewardPerSecond) /
          1e18;
    const rPerBlock = rPerSecond * averageBlockTime;
    const rPerDay = rPerBlock * blocksPerDay;
    rTokens[getAddress(props.farm.pools[0].rewarder.rewardToken)] = {
      rewardsPerDay: rPerDay.toFixed(4),
      tokenAddress: getAddress(props.farm.pools[0].rewarder.rewardToken)
    };
  }
  return rTokens;
});

const poolTokens = computed(() => getTokens(Object.keys(rewardTokens.value)));
</script>

<template>
  <BalCard noPad>
    <template #header>
      <div class="card-header">
        <h5 class="text-symmetric-500">
          Farm Rewards APR
        </h5>

        <h5 class="text-symmetric-500">{{ rewardAPR }} %</h5>
      </div>
    </template>
    <div class="px-4 py-2">
      <div
        v-for="(address, index) in rewardTokens"
        :key="address"
        class="asset-row"
      >
        <div class="flex items-center">
          <BalAsset :address="address" :size="36" class="mr-4" />
          <div class="flex flex-col">
            <span>
              {{ poolTokens[index].symbol }}
            </span>
            <span class="text-sm text-gray-500">
              {{ poolTokens[index].name }}
            </span>
          </div>
        </div>

        <span class="flex flex-col flex-grow text-right">
          <span>
            {{ address.rewardsPerDay }}
          </span>
          <span class="text-sm text-symmetric-500">
            Per Day
          </span>
        </span>
      </div>
    </div>
    <BalBtn
        tag="a"
            :href="EXTERNAL_LINKS.Symmetric.Farms"
            target="_blank"
            rel="noreferrer"
        label="Go to Farms"
        color="symmetric"
        block
      />
    <span class="text-sm text-gray-500">
      &nbsp; Stake your LP tokens into Farm to earn Rewards
    </span>
  </BalCard>
</template>

<style scoped>
.card-header {
  @apply p-4 w-full flex items-center justify-between;
  @apply border-b dark:border-gray-700;
}

.asset-row {
  @apply py-3 flex justify-between items-center text-lg;
}
</style>
