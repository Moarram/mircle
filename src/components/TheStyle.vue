<script setup lang="ts">
import { store } from '@/store'
import BaseColor from './BaseColor.vue'
import { scaleColor } from '@/utils'
import { computed } from 'vue'
import { TinyColor } from '@ctrl/tinycolor'

const circle = computed(() => new TinyColor(store.styles.background.circle).onBackground(store.styles.background.main).toHex8String())
const missing = computed(() => new TinyColor(store.styles.lines.missing).onBackground(circle.value).toHex8String())
const one = computed(() => new TinyColor(store.styles.lines.one).onBackground(circle.value).toHex8String())
const many = computed(() => new TinyColor(store.styles.lines.many).onBackground(circle.value).toHex8String())


</script>

<template>
  <div id="style">
    <div>Background</div>
    <div class="param">
      <label for="base-bg">Main:</label>
      <BaseColor id="base-bg" v-model="store.styles.background.main" />
    </div>
    <div class="param">
      <label for="circle-bg">Circle:</label>
      <BaseColor id="circle-bg" v-model="store.styles.background.circle" />
    </div>
    <div style="margin-top: 1rem;">Lines</div>
    <div class="param">
      <label for="missing-lines">Missing:</label>
      <BaseColor id="missing-lines" v-model="store.styles.lines.missing" />
    </div>
    <div class="param">
      <label for="one-lines">One:</label>
      <BaseColor id="one-lines" v-model="store.styles.lines.one" />
    </div>
    <div class="param">
      <label for="many-lines">Many:</label>
      <BaseColor id="many-lines" v-model="store.styles.lines.many" />
    </div>
    <div style="display: flex; margin-left: 1rem;">
      <div class="swatch" :style="{ background: missing }"></div>
      <div
        v-for="(percent, i) of [.1, .2, .3, .4, .5, .6, .7, .8, .9]"
        :key="i"
        :style="{ background: scaleColor([one, many], percent) }"
        class="swatch"
      ></div>
    </div>
  </div>
</template>

<style scoped>
#style {
  max-width: 15rem;
  padding: .5rem;
}

.param {
  display: flex;
  margin-left: 1rem;
  margin-bottom: .2rem;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  color: #DDD8;
}

label {
  margin-right: .5rem;
}

.swatch {
  flex-grow: 1;
  height: 1rem;
}
</style>