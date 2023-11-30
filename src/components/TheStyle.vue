<script setup lang="ts">
import { store } from '@/store'
import BaseCheckbox from './BaseCheckbox.vue';
import BaseColor from './BaseColor.vue'
import BaseNumber from './BaseNumber.vue';
import { computed } from 'vue'
import { Colorful } from '@moarram/util';

const circle = computed(() => new Colorful(store.styles.background.circle).on(store.styles.background.main).toString())
const missing = computed(() => new Colorful(store.styles.lines.missing).on(circle.value).toString())
const one = computed(() => new Colorful(store.styles.lines.one).on(circle.value).toString())
const many = computed(() => new Colorful(store.styles.lines.many).on(circle.value).toString())

const circle2 = computed(() => new Colorful(store.styles.background.circle2).on(store.styles.background.main).toString())
const missing2 = computed(() => new Colorful(store.styles.lines.missing).on(circle2.value).toString())
const one2 = computed(() => new Colorful(store.styles.lines.one).on(circle2.value).toString())
const many2 = computed(() => new Colorful(store.styles.lines.many).on(circle2.value).toString())

</script>

<template>
  <div id="style">
    <div>Background</div>
    <div class="param">
      <label for="circle-bg">Circle:</label>
      <BaseColor id="circle-bg" v-model="store.styles.background.circle" />
    </div>
    <div class="param">
      <label for="circle2-bg">Circle2:</label>
      <BaseColor id="circle2-bg" v-model="store.styles.background.circle2" />
    </div>
    <div style="display: flex; margin-left: 1rem;">
      <div
        v-for="(percent, i) of [.1, .2, .3, .4, .5, .6, .7, .8, .9]"
        :key="i"
        :style="{ background: Colorful.scale([circle, circle2], percent).toString() }"
        class="swatch"
      ></div>
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
    <div style="display: flex; margin-left: 1rem;">
      <div class="swatch" :style="{ background: missing2 }"></div>
      <div
        v-for="(percent, i) of [.1, .2, .3, .4, .5, .6, .7, .8, .9]"
        :key="i"
        :style="{ background: Colorful.scale([one2, many2], percent).toString() }"
        class="swatch"
      ></div>
    </div>
    <div class="param" style="margin-top: .5rem">
      <label for="short-lines">Short:</label>
      <BaseColor id="short-lines" v-model="store.styles.lines.short" />
    </div>

    <div class="param" style="margin-top: 1rem;">
      <label for="min-width">Min Width:</label>
      <BaseNumber
        id="min-width"
        v-model="store.styles.lines.minWidth"
        class="num"
        :min="0"
        :max="20"
        :step=".5"
      />px
    </div>
    <div class="param">
      <label for="max-width">Max Width:</label>
      <BaseNumber
        id="max-width"
        v-model="store.styles.lines.maxWidth"
        class="num"
        :min="0"
        :max="20"
        :step=".5"
      />px
    </div>

    <div style="margin-top: 1rem;">Options</div>
    <div style="margin-left: 1rem; margin-top: .5rem">
      <BaseCheckbox
        id="invert"
        v-model="store.options.invert"
      />
      <label for="invert">
        Invert
      </label>
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