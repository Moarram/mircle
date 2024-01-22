<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import ProgressBar from '@/components/ProgressBar.vue'
import TheMircle from '@/components/TheMircle.vue'
import TheControl from '@/components/TheControl.vue'
import { useStore } from '@/store'

const store = useStore()

const mircle = ref<InstanceType<typeof TheMircle>>()

if (import.meta.hot) {
  // re-render when Vite reloads files
  import.meta.hot.on('vite:afterUpdate', () => {
    mircle.value?.rerender()
  })
}

onMounted(() => {
  mircle.value?.render()
})

const { specification, autoRender } = storeToRefs(store)
watch([specification, autoRender], () => {
  // re-render when options change
  if (store.autoRender) {
    mircle.value?.rerender()
  }
})

const progressText = computed(() => {
  if (store.activity !== 'render') return 'Done!'
  const mod = store.specification.modulo // alias
  const lines = store.specification.multiple ? mod : (mod * (mod - 1)) / 2
  return `Rendering ${lines} lines...`
})
</script>

<template>
  <div id="main">
    <div style="
      width: calc(min(100vw, 100vh) - var(--gap) * 2);
      height: calc(min(100vw, 100vh) - var(--gap) * 2);
    ">
      <TheMircle ref="mircle" />
    </div>

    <div style="
      max-width: fit-content;
      margin-bottom: 2rem;
      position: relative;
      flex-grow: 1;
      flex-basis: 10rem;
      align-self: center;
    ">
      <TheControl @render="mircle?.rerender" @abort="mircle?.abort" @download="mircle?.download" />

      <div
        style="position: absolute; bottom: -2rem; left: 1rem; right: 1rem; transition: opacity 1s ease-in;"
        :style="{ opacity: store.activity === 'render' ? 1 : 0 }"
      >
        <ProgressBar :percent="store.renderProgress" />
        <div style="position: absolute; margin-top: .5rem; color: #FFFC">{{ progressText }}</div>
      </div>
    </div>
    <div style="position: absolute; bottom: .5rem; right: 1rem; color: #DDD8">
      <span style="font-style: italic;">Mircle</span> by Moarram (<a href="https://github.com/Moarram/mircle" target="_blank">Source</a>)
    </div>
  </div>
</template>

<style scoped>
#main {
  min-height: calc(100vh - var(--gap) * 2);
  margin: auto;
  padding: var(--gap);
  position: relative;
  display: flex;
  flex-flow: row wrap;
  gap: var(--gap);
  align-content: flex-start;
  justify-content: space-evenly;
}
</style>
