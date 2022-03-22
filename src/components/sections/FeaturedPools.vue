<template>
  <div>
    <h3 class="mb-4">{{ $t('featuredProtocol') }}</h3>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 lg:col-span-4">
        <BalCard
          title="What’s coming with Symmetric v2?"
          imgSrc="https://miro.medium.com/max/1200/0*IB8Epue3yfd3NHMq.jpeg"
          class="transition-shadow hover:shadow-xl"
          hFull
          growContent
        >
          <p>
            {{ $t('cardOneText') }}
          </p>
          <template v-slot:footer>
            <BalLink :href="EXTERNAL_LINKS.Element.Earn" external>
              <span>{{ $t('viewAndReadMoreCard1') }}</span>
              <BalIcon name="arrow-up-right" size="sm" class="ml-1" />
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div class="col-span-12 md:col-span-6 lg:col-span-4">
        <BalCard
          title="Symmetric-PrimeDAO Partnership"
          imgSrc="https://miro.medium.com/max/1400/0*GKnpKS01rfdrqoi8"
          class="transition-shadow hover:shadow-xl"
          hFull
          growContent
        >
          <span>
            Symmetric and PrimeDAO areannounced a partnership between the two DAOs that will align our interests, bring a fair and efficient token launchpad to Celo and Gnosis.
          </span>
          <template v-slot:footer>
            <BalLink :href="EXTERNAL_LINKS.Symmetric.PrimeDaoMedium" external>
              <span>{{ $t('viewAndReadMoreCard2') }}</span>
              <BalIcon name="arrow-up-right" size="sm" class="ml-1" />
            </BalLink>
          </template>
        </BalCard>
      </div>
      <div style="max-height:400px; overflow:auto !important" class="col-span-12 md:col-span-6 lg:col-span-4">
       
        <BalCard
          class="transition-shadow hover:shadow-xl"
          imgSrc="https://pbs.twimg.com/profile_banners/1384941129796395010/1640465820/1500x500"
        >
 <div>
    <a class="twitter-timeline" href="https://twitter.com/0xSymmetric?ref_src=twsrc%5Etfw"></a> 
  </div>
  
        </BalCard>
        
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { EXTERNAL_LINKS } from '@/constants/links';
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup() {
    const { t } = useI18n();
    return {
      EXTERNAL_LINKS,
      t
    };
  }
});
</script>
