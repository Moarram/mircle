<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TheMircle from '@/components/TheMircle.vue'
import { store } from './store';
import TheControls from './components/TheControls.vue';

const mircle = ref<InstanceType<typeof TheMircle>>()

onMounted(() => {
  const size = Math.min(window.innerWidth, window.innerHeight) * (window.devicePixelRatio || 1) *2
  // store.layout.size = size
  store.layout.padding = size / 100
  mircle.value?.render()
})

</script>

<template>
  <main>
    <TheMircle ref="mircle" />
    <TheControls @render="mircle?.render" @abort="mircle?.abort" @download="mircle?.download" />
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-flow: row wrap;
}
</style>

<style>
body {
  margin: 0;
  background: black
}
#app {
  font-family: Courier, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #DDD;
  margin: 0;
  padding: 0;
  background: #070707;
}
</style>
