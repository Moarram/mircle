<script setup lang="ts">
import { useStore } from '@/store'
import { group, primeFactors } from '@/utils';
import { computed, ref } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseCheckbox from './BaseCheckbox.vue';
import BaseNumber from './BaseNumber.vue';

const store = useStore()

const factorsHtml = computed(() => {
  const factors = primeFactors(store.specification.modulo)
  if (!factors.length) return ['']
  const grouped = group(factors, n => n)
  const powered = [...grouped.entries()].map(([factor, items]) => items.length > 1 ? `${factor}<sup>${items.length}</sup>` : factor)
  return powered.join('\u200B×')
})

const localMultiple = ref(2)
const expanded = ref(false)

</script>

<template>
  <div id="layout">

    <div style="width: 100%; display: flex; justify-content: space-between;">
      <div class="param">
        <label for="modulo">Vertices:</label>
        <BaseNumber
          id="modulo"
          :model-value="store.specification.modulo"
          @update:model-value="val => store.modulo = val"
          :min="0"
          :max="store.multiple === 'all' ? 999 : 99999"
          :step="1"
        />
        <div class="detail" style="min-width: 8rem;" v-html="factorsHtml"></div>
        <!-- <div class="detail">
          ({{ lines }}&nbsp;lines)
        </div> -->
      </div>
      <BaseButton content="Options" @click="expanded = !expanded" :engaged="expanded" />
    </div>

    <div v-if="expanded">
      <div class="param" style="margin-top: 1rem;">
        <label for="multiple">Multiple:</label>
        <div class="ctrl">
          <BaseCheckbox
            id="all-multiples"
            :model-value="store.multiple === 'all'"
            @update:model-value="val => val ? store.multiple = 'all' : store.multiple = localMultiple"
            style="margin: .5rem"
          />
          <label for="all-multiples">All</label>
        </div>
        <BaseNumber
          id="multiple"
          v-if="store.multiple !== 'all'"
          :model-value="localMultiple"
          @update:model-value="val => {
            localMultiple = val
            store.multiple = val
          }"
          :min="0"
          :max="store.specification.modulo"
          :step="1"
        />
      </div>
      <div class="param" style="margin-top: 1rem; max-width: 100%;">
        <label for="size">Image size:</label>
        <div>
          <BaseButton content="Auto" @click="store.size = 'auto'" :engaged="store.size === 'auto'" :border-right="true" :square-right="true" />
          <BaseButton content="2000" @click="store.size = 2000" :engaged="store.size === 2000" :border-right="true" :square-right="true" :square-left="true" />
          <BaseButton content="4000" @click="store.size = 4000" :engaged="store.size === 4000" :border-right="true" :square-right="true" :square-left="true" />
          <BaseButton content="10000" @click="store.size = 10000" :engaged="store.size === 10000" :square-left="true" style="color: #B00" />
        </div>
        <BaseNumber
          id="size"
          :model-value="store.specification.size"
          @update:model-value="val => store.size = val"
          :min="0"
          :max="16384"
          style="margin-left: 1em;"
        />
        <div style="padding-left: .3em;">px<sup>2</sup></div>
      </div>
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
.ctrl {
  user-select: none;
}
label {
  margin-right: .5rem;
}
.detail {
  margin-left: .7rem;
  color: #DDD8;
}
</style>