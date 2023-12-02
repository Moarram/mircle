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
      <div>
        <BaseButton content="small" @click="store.layout.size = 1000" :engaged="store.layout.size === 1000" :square-right="true" />
        <BaseButton content="medium" @click="store.layout.size = 2000" :engaged="store.layout.size === 2000" :square-right="true" :square-left="true" />
        <BaseButton content="large" @click="store.layout.size = 4000" :engaged="store.layout.size === 4000" :square-right="true" :square-left="true" />
        <BaseButton content="huge" @click="store.layout.size = 10000" :engaged="store.layout.size === 10000" :square-left="true" style="color: #B00" />
      </div>
      <BaseNumber
        id="size"
        v-model="store.layout.size"
        :min="0"
        :max="20000"
        style="margin-left: 1em;"
      />
      <div style="padding-left: .3em;">px</div>
    </div>
    <div class="param" style="margin-top: 1rem; max-width: 100%;">
      <label for="modulo">Points:</label>
      <BaseNumber
        id="modulo"
        v-model="store.layout.modulo"
        :min="0"
        :max="999"
        :step="1"
      />
      <div class="detail">
        {{ factors.length > 1 ? factors.join('&#8203;×') : '' }}
      </div>
      <!-- <div class="detail">
        ({{ lines }}&nbsp;lines)
      </div> -->
    </div>
  </div>
</template>

<style scoped>
#layout {
  padding: .5rem;
}
.param {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}
label {
  margin-right: .5rem;
}
.detail {
  margin-left: .7rem;
  color: #DDD8;
}
</style>