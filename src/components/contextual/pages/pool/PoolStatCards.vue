<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <template v-if="loading">
      <BalLoadingBlock v-for="n in 4" :key="n" class="h-24" />
    </template>
    <template v-else>
      <BalCard v-for="(stat, i) in stats" :key="i">
        <div class="mb-2 text-sm font-medium text-gray-500">
          {{ stat.label }}
        </div>
        <div class="flex items-center text-xl font-medium truncate">
          {{ stat.value }}
          <LiquidityAPRTooltip :pool="pool" v-if="stat.id === 'apr'" />
        </div>
      </BalCard>
    </template>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers from '@/composables/useNumbers';

import { DecoratedPool } from '@/services/balancer/subgraph/types';

import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import { APR_THRESHOLD } from '@/constants/poolAPR';

export default defineComponent({
  components: {
    LiquidityAPRTooltip
  },

  props: {
    pool: { type: Object as PropType<DecoratedPool> },
    loading: { type: Boolean, default: true }
  },

  setup(props) {
    // COMPOSABLES
    const { fNum } = useNumbers();
    const { t } = useI18n();

    // COMPUTED
    const stats = computed(() => {
      if (!props.pool) return [];

      return [
        {
          id: 'poolValue',
          label: t('poolValue'),
          value: fNum(props.pool.totalLiquidity, 'usd')
        },
        {
          id: 'volumeTime',
          label: t('volumeTime', ['24h']),
          value: fNum(props.pool.dynamic.volume, 'usd')
        },
        {
          id: 'feesTime',
          label: t('feesTime', ['24h']),
          value: fNum(props.pool.dynamic.fees, 'usd')
        },
        {
          id: 'apr',
          label: 'SWAP APR',
          value:
            Number(props.pool.dynamic.apr.total) > APR_THRESHOLD
              ? '-'
              : fNum(props.pool.dynamic.apr.total, 'percent')
        }
      ];
    });

    return {
      stats
    };
  }
});
</script>
