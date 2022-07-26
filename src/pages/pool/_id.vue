<template>
  <div class="pt-8 lg:container lg:mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <div class="col-span-2">
        <BalLoadingBlock v-if="loadingPool" class="h-16" />
        <div v-else class="flex flex-col px-4 lg:px-0">
          <div class="flex flex-wrap items-center -mt-2">
            <h3 class="pool-title">
              {{ poolTypeLabel }}
            </h3>
            <div
              v-for="([address, tokenMeta], i) in titleTokens"
              :key="i"
              class="flex items-center h-10 px-2 mt-2 mr-2 rounded-lg bg-gray-50 dark:bg-gray-850"
            >
              <BalAsset :address="address" />
              <span class="ml-2">
                {{ tokenMeta.symbol }}
              </span>
              <span
                v-if="!isStableLikePool"
                class="mt-px ml-1 text-xs font-medium text-gray-400"
              >
                {{ fNum(tokenMeta.weight, 'percent_lg') }}
              </span>
            </div>
            <BalChip
              v-if="pool.dynamic.isNewPool"
              color="red"
              size="sm"
              class="mt-2 mr-2 uppercase"
              :outline="false"
            >
              {{ $t('new') }}
            </BalChip>
            <LiquidityAPRTooltip :pool="pool" class="mt-1 -ml-1" />
          </div>
          <div class="flex items-center mt-2">
            <div v-html="poolFeeLabel" class="text-sm text-gray-600" />
            <BalTooltip>
              <template v-slot:activator>
                <BalLink
                  v-if="feesManagedByGauntlet"
                  :href="EXTERNAL_LINKS.Gauntlet.Home"
                  external
                >
                  <GauntletIcon class="ml-2" />
                </BalLink>
                <BalIcon
                  v-else
                  name="info"
                  size="xs"
                  class="ml-2 text-gray-400"
                />
              </template>
              <span>
                {{ swapFeeToolTip }}
              </span>
            </BalTooltip>
          </div>
        </div>

        <BalAlert
          v-if="!appLoading && missingPrices"
          type="warning"
          :title="$t('noPriceInfo')"
          class="mt-2"
          block
        />
        <BalAlert
          v-if="!appLoading && hasCustomToken"
          type="error"
          :title="$t('highRiskPool')"
          class="mt-2"
          block
        />
        <BalAlert
          v-if="!appLoading && noInitLiquidity"
          type="warning"
          :title="$t('noInitLiquidity')"
          :description="$t('noInitLiquidityDetail')"
          class="mt-2"
          block
        />
      </div>

      <div class="hidden lg:block" />

      <div class="order-2 col-span-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <div class="px-1 lg:px-0">
            <PoolChart
              :pool="pool"
              :historicalPrices="historicalPrices"
              :snapshots="snapshots"
              :loading="isLoadingSnapshots"
              :totalLiquidity="pool?.totalLiquidity"
              :tokensList="pool?.tokensList"
              :poolType="pool?.poolType"
            />
          </div>
          <div class="px-1 mb-4 lg:px-0">
            <PoolStatCards :pool="pool" :loading="loadingPool" />
          </div>

          <div class="mb-4">
            <h4 v-text="$t('poolComposition')" class="px-4 mb-4 lg:px-0" />
            <PoolBalancesCard :pool="pool" :loading="loadingPool" />
          </div>

          <div>
            <h4
              v-text="$t('poolTransactions.title')"
              class="px-4 mb-2 lg:px-0"
            />
            <PoolTransactionsCard :pool="pool" :loading="loadingPool" />
          </div>
        </div>
      </div>

      <div
        v-if="!isLiquidityBootstrappingPool"
        class="order-1 px-1 lg:order-2 lg:px-0"
      >
        <BalLoadingBlock
          v-if="loadingPool"
          class="mb-4 pool-actions-card h-60"
        />
        <MyPoolBalancesCard
          v-else-if="!noInitLiquidity"
          :pool="pool"
          :missingPrices="missingPrices"
          class="mb-4"
        />

        <BalLoadingBlock v-if="loadingPool" class="h-40 pool-actions-card" />
        <PoolActionsCard
          v-else-if="!noInitLiquidity"
          :pool="pool"
          :missingPrices="missingPrices"
          class="mb-4"
        />
        <BalLoadingBlock v-if="loadingPool" class="h-40 pool-actions-card" />
        <PoolFarmCard
          v-if="!loadingPool && farmAvailable"
          :pool="pool"
          :farm="farm"
          class="mb-4"
        />
      </div>
      <!-- <div v-else class="order-1 px-1 lg:order-2 lg:px-0">
        <BalCard
          v-if="isCopperPool"
          noPad
          imgSrc="/images/partners/copper-launch.png"
        >
          <div class="p-4 mt-2">
            <div class="mb-4 font-semibold">
              {{ $t('copperLaunchPromo.title') }}
            </div>
            <div class="mb-4 text-sm">
              {{ $t('copperLaunchPromo.description') }}
            </div>
            <div class="mb-4 text-sm italic">
              {{ $t('copperLaunchPromo.poweredByBalancer') }}
            </div>
            <BalLink
              :href="
                EXTERNAL_LINKS.Copper.Auctions(
                  pool.address,
                  copperNetworkPrefix
                )
              "
              external
              class="block hover:no-underline"
            >
              <BalBtn color="blue" block
                >{{ $t('copperLaunchPromo.buttonLabel') }}
                <BalIcon name="arrow-up-right" size="sm" class="ml-1"
              /></BalBtn>
            </BalLink>
          </div>
        </BalCard>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch } from 'vue';
import * as PoolPageComponents from '@/components/contextual/pages/pool';
import GauntletIcon from '@/components/images/icons/GauntletIcon.vue';
import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import useNumbers from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import useFarmsQuery from '@/composables/queries/useFarmsQuery';
import useSymmetricQueries from '@/composables/queries/useSymmetricQueries';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';
import { POOLS } from '@/constants/pools';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useApp from '@/composables/useApp';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';

interface PoolPageData {
  id: string;
}

export default defineComponent({
  components: {
    ...PoolPageComponents,
    GauntletIcon,
    LiquidityAPRTooltip
  },

  setup() {
    /**
     * COMPOSABLES
     */
    const { appLoading } = useApp();
    const { t } = useI18n();
    const route = useRoute();
    const { fNum } = useNumbers();
    const { isWalletReady } = useWeb3();
    const { prices } = useTokens();
    const { blockNumber, isKovan, isMainnet, isPolygon, isCelo } = useWeb3();
    const { addAlert, removeAlert } = useAlerts();
    const { balancerTokenListTokens } = useTokens();

    /**
     * QUERIES
     */
    const poolQuery = usePoolQuery(route.params.id as string);
    const farmQuery = useFarmsQuery(route.params.id.toString().substr(0, 42));
    // const v2Prices = useSymmetricQueries(['0x8427bd503dd3169ccc9aff7326c15258bc305478']);
    // console.log('V2 prices', v2Prices)

    const poolSnapshotsQuery = usePoolSnapshotsQuery(
      route.params.id as string,
      30
    );

    /**
     * STATE
     */
    const data = reactive<PoolPageData>({
      id: route.params.id as string
    });

    /**
     * COMPUTED
     */
    const pool = computed(() => poolQuery.data.value);
    const farm = computed(() => farmQuery.data.value?.pages[0]);
    const {
      isStableLikePool,
      isLiquidityBootstrappingPool,
      isStablePhantomPool
    } = usePool(poolQuery.data);

    const noInitLiquidity = computed(
      () =>
        !loadingPool.value &&
        pool.value &&
        Number(pool.value.onchain.totalSupply) === 0
    );

    const farmAvailable = computed(() => farm?.value?.pools.length);
    const communityManagedFees = computed(
      () =>
        pool.value?.owner ==
        (isCelo.value ? POOLS.DelegateOwner : POOLS.gnosisDelegateOwner)
    );
    const feesManagedByGauntlet = computed(
      () =>
        communityManagedFees.value &&
        POOLS.DynamicFees.Gauntlet.includes(data.id)
    );
    const feesFixed = computed(() => pool.value?.owner == POOLS.ZeroAddress);
    const swapFeeToolTip = computed(() => {
      if (feesManagedByGauntlet.value) {
        return t('feesManagedByGauntlet');
      } else if (communityManagedFees.value) {
        return t('delegateFeesTooltip');
      } else if (feesFixed.value) {
        return t('fixedFeesTooltip');
      } else {
        return t('ownerFeesTooltip');
      }
    });

    const poolQueryLoading = computed(
      () =>
        poolQuery.isLoading.value ||
        poolQuery.isIdle.value ||
        poolQuery.error.value
    );
    const farmQueryLoading = computed(
      () =>
        farmQuery.isLoading.value ||
        farmQuery.isIdle.value ||
        farmQuery.error.value
    );

    const loadingPool = computed(() => poolQueryLoading.value || !pool.value);
    const loadingFarm = computed(() => farmQueryLoading.value || !farm.value);

    const snapshots = computed(() => poolSnapshotsQuery.data.value?.snapshots);
    const historicalPrices = computed(
      () => poolSnapshotsQuery.data.value?.prices
    );
    const isLoadingSnapshots = computed(
      () =>
        poolSnapshotsQuery.isLoading.value || poolSnapshotsQuery.isIdle.value
    );

    const titleTokens = computed(() => {
      if (!pool.value) return [];

      return Object.entries(pool.value.onchain.tokens).sort(
        ([, a]: any[], [, b]: any[]) => b.weight - a.weight
      );
    });

    const poolTypeLabel = computed(() => {
      if (!pool.value) return '';
      const key: string | undefined = Object.keys(POOLS.Factories).find(
        (key: string) => key.toLowerCase() === pool.value?.factory.toLowerCase()
      );
      if (!key) return '';
      const value = POOLS.Factories[key];
      return value ? t(value) : t('unknownPoolType');
    });

    const poolFeeLabel = computed(() => {
      if (!pool.value) return '';
      const feeLabel = `${fNum(
        pool.value.onchain.swapFee,
        'percent_variable'
      )}`;

      if (feesFixed.value) {
        return t('fixedSwapFeeLabel', [feeLabel]);
      } else if (communityManagedFees.value) {
        return feesManagedByGauntlet.value
          ? t('dynamicSwapFeeLabel', [feeLabel])
          : t('communitySwapFeeLabel', [feeLabel]);
      }

      // Must be owner-controlled
      return t('dynamicSwapFeeLabel', [feeLabel]);
    });

    const missingPrices = computed(() => {
      if (pool.value) {
        const tokensWithPrice = Object.keys(prices.value);

        const tokens =
          isStablePhantomPool.value && pool.value.mainTokens
            ? pool.value.mainTokens
            : pool.value.tokenAddresses;

        return !tokens.every(token => tokensWithPrice.includes(token));
      }
      return false;
    });

    const isCopperNetworkSupported = computed(
      () => isMainnet.value || isPolygon.value || isKovan.value
    );

    // Temporary solution to hide Copper card on Fei pool page.
    // Longer terms solution is needed distinguish LBP platforms
    // and display custom widgets linking to their pages.
    const isCopperPool = computed((): boolean => {
      const feiPoolId =
        '0xede4efcc5492cf41ed3f0109d60bc0543cfad23a0002000000000000000000bb';
      return (
        !!pool.value &&
        isLiquidityBootstrappingPool.value &&
        pool.value.id !== feiPoolId &&
        isCopperNetworkSupported.value
      );
    });

    const copperNetworkPrefix = computed(() => {
      if (isPolygon.value) {
        return 'polygon.';
      }
      if (isKovan.value) {
        return 'kovan.';
      }
      return '';
    });

    const hasCustomToken = computed(() => {
      const knownTokens = Object.keys(balancerTokenListTokens.value);
      return (
        !!pool.value &&
        !isLiquidityBootstrappingPool.value &&
        !isStablePhantomPool.value &&
        pool.value.tokenAddresses.some(
          address => !knownTokens.includes(address)
        )
      );
    });

    /**
     * METHODS
     */
    function onNewTx(): void {
      poolQuery.refetch.value();
    }

    /**
     * WATCHERS
     */
    watch(blockNumber, () => {
      poolQuery.refetch.value();
    });

    watch(poolQuery.error, () => {
      if (poolQuery.error.value) {
        addAlert({
          id: 'pool-fetch-error',
          label: t('alerts.pool-fetch-error'),
          type: AlertType.ERROR,
          persistent: true,
          action: poolQuery.refetch.value,
          actionLabel: t('alerts.retry-label'),
          priority: AlertPriority.MEDIUM
        });
      } else {
        removeAlert('pool-fetch-error');
      }
    });

    return {
      // data
      ...toRefs(data),
      EXTERNAL_LINKS,
      // computed
      appLoading,
      pool,
      farm,
      noInitLiquidity,
      farmAvailable,
      poolTypeLabel,
      poolFeeLabel,
      historicalPrices,
      snapshots,
      isLoadingSnapshots,
      loadingPool,
      titleTokens,
      isWalletReady,
      missingPrices,
      feesManagedByGauntlet,
      swapFeeToolTip,
      isStableLikePool,
      isLiquidityBootstrappingPool,
      isCopperPool,
      isStablePhantomPool,
      copperNetworkPrefix,
      hasCustomToken,
      // methods
      fNum,
      onNewTx
    };
  }
});
</script>

<style scoped>
.pool-title {
  @apply mr-4 capitalize mt-2;
  font-variation-settings: 'wght' 700;
}

.pool-actions-card {
  @apply relative;
}

@media (min-width: 768px) and (min-height: 600px) {
  .pool-actions-card {
    @apply sticky top-24;
  }
}
</style>
