<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs} from 'pinia'
import { useStore } from './store';
import TheMircle from '@/components/TheMircle.vue'
import TheControls from './components/TheControls.vue';
import TheLayout from './components/TheLayout.vue';
// import TheStyle from './components/TheStyle.vue';
import ProgressBar from './components/ProgressBar.vue';
import { delayFrames } from './utils';

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
  <main>
    <div id="display">
      <TheMircle ref="mircle" />
    </div>
    <div id="panel">
      <TheLayout />
      <div style="width: calc(100% - 1rem); margin: .5rem; border-bottom: 1px solid #333;"></div>
      <TheControls @render="mircle?.rerender" @abort="mircle?.abort" @download="mircle?.download" />
      <!-- <TheStyle /> -->
      <div
        style="position: absolute; bottom: -2rem; left: 1rem; right: 1rem; transition: opacity 1s ease-in;"
        :style="{ opacity: store.activity === 'render' ? 1 : 0 }"
      >
        <ProgressBar :percent="store.renderProgress" />
        <div style="position: absolute; margin-top: .5rem; color: #FFFC">{{ progressText }}</div>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  min-height: calc(100vh - var(--gap) * 2);
  margin: auto;
  padding: var(--gap);
  display: flex;
  flex-flow: row wrap;
  gap: var(--gap);
  align-content: flex-start;
  justify-content: space-evenly;
  background: #000;
}
#display {
  width: calc(min(100vw, 100vh) - var(--gap) * 2);
  height: calc(min(100vw, 100vh) - var(--gap) * 2);
}
#panel {
  max-width: fit-content;
  margin-bottom: 2rem;
  padding: .5rem;
  position: relative;
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  flex-basis: 10rem;
  align-self: center;
  border: 1px solid #333;
  border-radius: calc(1rem + 3px);
}
</style>

<style>
:root {
  --gap: 20px;
  font-size: 14px;
}

body {
  margin: 0;
  background: #000;
}

#app {
  font-family: "Fira Code", Courier, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #FFFC;
  margin: 0;
  padding: 0;
  background: #000;
}
</style>
