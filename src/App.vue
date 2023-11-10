<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { store } from './store';
import TheMircle from '@/components/TheMircle.vue'
import TheControls from './components/TheControls.vue';
import TheLayout from './components/TheLayout.vue';
import TheStyle from './components/TheStyle.vue';
import ProgressBar from './components/ProgressBar.vue';

const mircle = ref<InstanceType<typeof TheMircle>>()

onMounted(() => {
  const ratio = window.devicePixelRatio || 1
  const size = Math.min(window.innerWidth, window.innerHeight) * ratio
  store.layout.size = size - 20 * ratio
  mircle.value?.render()
})

watch([store.layout, store.styles], () => {
  if (store.autoRender) {
    if (store.isRendering) mircle.value?.abort()
    if (!store.isDownloading) mircle.value?.render()
  }
})
</script>

<template>
  <main :style="{ background: store.styles.background.main }">
    <div id="display">
      <TheMircle ref="mircle" />
    </div>
    <div id="panel">
      <TheControls @render="mircle?.render" @abort="mircle?.abort" @download="mircle?.download" />
      <TheLayout />
      <TheStyle />
      <ProgressBar v-if="store.isRendering" :percent="store.renderProgress" style="max-width: 10rem; margin: 1.5rem;" />
    </div>
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
  display: flex;
  flex-flow: row wrap;
}
#display {
  width: calc(min(100vw, 100vh) - 20px);
  height: calc(min(100vw, 100vh) - 20px);
  padding: 10px;
}
#panel {
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  flex-basis: 8rem;
}
</style>

<style>
body {
  margin: 0;
  background: #000;
}
#app {
  font-family: Courier, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #DDD;
  margin: 0;
  padding: 0;
  background: #000;
}
</style>
