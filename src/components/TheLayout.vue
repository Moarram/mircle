<script setup lang="ts">
import { store } from '@/store'
import BaseNumber from './BaseNumber.vue';
import { primeFactors } from '@/utils';
import { computed } from 'vue';
import BaseButton from './BaseButton.vue';

const factors = computed(() => primeFactors(store.layout.modulo))
const lines = computed(() => store.layout.multiple ? store.layout.modulo : (store.layout.modulo * (store.layout.modulo - 1)) / 2)

</script>

<template>
  <div id="layout">
    <div class="param">
      <label for="size">Size:</label>
      <BaseNumber
        id="size"
        v-model="store.layout.size"
        class="num"
        :min="0"
        :max="20000"
      />
      <div>px</div>
    </div>
    <div style="margin-left: 1rem;">
      <BaseButton content="small" @click="store.layout.size = 1000" />
      <BaseButton content="medium" @click="store.layout.size = 2000" />
      <BaseButton content="large" @click="store.layout.size = 4000" />
      <BaseButton content="huge" @click="store.layout.size = 10000" style="color: #B00" />
    </div>
    <div class="param" style="margin-top: 1rem;">
      <label for="modulo">Points:</label>
      <BaseNumber
        id="modulo"
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
  margin-left: 1rem;
  margin-bottom: .2rem;
  color: #DDD8;
}
</style>