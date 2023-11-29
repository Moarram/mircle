<script setup lang="ts">
import { store } from '@/store'
import BaseColor from './BaseColor.vue'
import { computed } from 'vue'
import { Colorful } from '@moarram/util';

const circle = computed(() => new Colorful(store.styles.background.circle).on(store.styles.background.main).toString())
const missing = computed(() => new Colorful(store.styles.lines.missing).on(circle.value).toString())
const one = computed(() => new Colorful(store.styles.lines.one).on(circle.value).toString())
const many = computed(() => new Colorful(store.styles.lines.many).on(circle.value).toString())

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
        :style="{ background: Colorful.scale([one, many], percent).toString() }"
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