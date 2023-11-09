<script setup lang="ts">
import { store } from '@/store'
import BaseNumber from './BaseNumber.vue';
import { primeFactors } from '@/utils';
import { computed } from 'vue';

const factors = computed(() => primeFactors(store.layout.modulo))
const lines = computed(() => (store.layout.modulo * (store.layout.modulo - 1)) / 2)

</script>

<template>
  <div id="layout">
    <div class="param">
      <label>Size:</label>
      <BaseNumber
        v-model="store.layout.size"
        class="num"
        :min="0"
        :max="20000"
      />
      <div>px</div>
    </div>
    <div class="param">
      <label>Points:</label>
      <BaseNumber
        v-model="store.layout.modulo"
        class="num"
        :min="0"
        :max="999"
        :step="1"
      />
    </div>
    <div class="detail">
      Factors: {{ factors.join('×') }}
    </div>
    <div class="detail">
      Lines: {{ lines }}
    </div>
  </div>
</template>

<style scoped>
#layout {
  padding: .5rem;
}
.param {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
label {
  margin-right: .5rem;
}
.num {
  margin: .2rem;
}
.detail {
  margin-left: .5rem;
  color: #DDD8;
}
</style>