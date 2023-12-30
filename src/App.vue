<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { store } from './store';
import TheMircle from '@/components/TheMircle.vue'
import TheControls from './components/TheControls.vue';
import TheLayout from './components/TheLayout.vue';
// import TheStyle from './components/TheStyle.vue';
import ProgressBar from './components/ProgressBar.vue';
import { delayFrames } from './utils';

const mircle = ref<InstanceType<typeof TheMircle>>()

if (import.meta.hot) {
  // re-render when Vite reloads files
  import.meta.hot.on('vite:afterUpdate', () => {
    mircle.value?.rerender()
  })
}

onMounted(() => {
  // set initial size relative to display
  const ratio = window.devicePixelRatio || 1
  const size = Math.min(window.innerWidth, window.innerHeight) * ratio
  store.layout.size = size - 20 * ratio
})

watch([store.layout, store.options], () => {
  // re-render when options change
  if (store.options.autoRender) {
    mircle.value?.rerender()
  }
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
      <div style="position: absolute; bottom: -2rem; left: 1rem; right: 1rem">
        <ProgressBar v-if="store.isRendering" :percent="store.renderProgress" />
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
