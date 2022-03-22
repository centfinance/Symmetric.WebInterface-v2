<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        class="text-base"
        :class="{ btn: upToLargeBreakpoint }"
        :loading="isLoadingProfile"
        :loading-label="upToLargeBreakpoint ? '' : $t('connecting')"
        color="white"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        :circle="upToLargeBreakpoint"
      >
        <!-- <Avatar
          :iconURI="profile?.avatar"
          :address="account"
          :size="avatarSize"
        /> -->
        <span
          v-if="profile && profile.ens"
          v-text="profile && profile.ens"
          class="pl-2 hidden lg:inline-block"
        />
        <span v-else class="pl-2 hidden lg:inline-block">
          <span v-if="name" v-text="name" />
          <span v-else v-text="_shorten(account)" />
        </span>
      </BalBtn>
    </template>
    <AppNavSettings />
  </BalPopover>
</template>

<script lang="ts">
import { computed, ref, defineComponent } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import AppNavSettings from './AppNavSettings.vue';
// import Avatar from '@/components/images/Avatar.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { getName } from '@/lib/utils/nomspace';

export default defineComponent({
  name: 'AppNavAccountBtn',

  components: {
    AppNavSettings
    // Avatar
  },

  setup() {
    const { bp, upToLargeBreakpoint } = useBreakpoints();
    const { isLoadingProfile, profile, account } = useWeb3();
    const name = ref('');
    getName(account.value).then(data => (name.value = data));

    const avatarSize = computed(() => {
      if (bp.value === 'sm') {
        return 35;
      } else if (['md', 'lg'].includes(bp.value)) {
        return 40;
      } else {
        return 20;
      }
    });

    return {
      // computed
      bp,
      account,
      name,
      profile,
      avatarSize,
      upToLargeBreakpoint,
      isLoadingProfile
    };
  }
});
</script>
