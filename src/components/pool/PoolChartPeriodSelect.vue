<script setup lang="ts">
import { PoolChartPeriod } from '@/components/contextual/pages/pool/PoolChart.vue';

/**
 * TYPES
 */
type Props = {
  options: PoolChartPeriod[];
  activeOption: PoolChartPeriod;
};

/**
 * PROPS
 */
defineProps<Props>();
</script>

<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <div class="h-10 text-base period-select-input">
        <div class="flex items-center justify-between flex-1 h-full">
          <div class="period-select-input__selected">
            {{ activeOption.text }}
          </div>
          <BalIcon name="chevron-down" />
        </div>
      </div>
    </template>
    <template v-slot="{ close }">
      <div @click="close" class="flex flex-col overflow-hidden rounded-lg w-44">
        <div
          class="px-3 py-2 text-sm font-medium text-gray-500 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-900 whitespace-nowrap"
        >
          {{ $t('poolChart.period.title') }}:
        </div>
        <div
          v-for="option in options"
          :key="option.days"
          @click="$emit('change-option', option)"
          class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850"
        >
          <div class="flex items-center ml-1 font-medium">
            {{ option.text }}
          </div>
          <BalIcon
            v-if="activeOption.days === option.days"
            name="check"
            class="text-blue-500"
          />
        </div>
      </div>
    </template>
  </BalPopover>
</template>

<style scoped>
.period-select-input {
  @apply relative w-28 rounded-lg shadow hover:shadow-none focus:shadow-none overflow-hidden px-2 bg-gray-50 dark:bg-gray-800 transition-all;
}

.period-select-input__selected {
  @apply flex items-center font-bold h-full leading-loose bg-transparent leading-none -ml-px text-xs;
  -webkit-appearance: none;
  -moz-appearance: none;
  text-indent: 1px;
  text-overflow: '';
}

.period-select-input .bal-icon :deep(svg) {
  @apply transition-all;
  /* blue-500 */
  stroke: #384aff;
}

.period-select-input:hover .bal-icon :deep(svg),
.period-select-input:focus .bal-icon :deep(svg) {
  /* pink-500 */
  stroke: #f21bf6;
}
</style>