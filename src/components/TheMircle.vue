<script setup lang="ts">
import type { Progress } from '../modules/types';
import { createMircle, createMircleWithWorker } from '../modules/mircle'
import { onMounted } from 'vue';

const props = defineProps({
  modulo: Number, // The number of points around the Mircle
})

const emit = defineEmits(['progress'])

function onProgress(progress: Progress) {
  emit('progress', progress)
}

onMounted(() => {
  const canvas = document.getElementById('mircle') as HTMLCanvasElement
  const offscreenCanvas = canvas.transferControlToOffscreen()
  const controller = new AbortController()

  createMircleWithWorker({
    canvas: offscreenCanvas,
    modulo: 356,
    size: 1000,
    padding: 50,
    onProgress,
    signal: controller.signal
  })

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') controller.abort()
  })
})
</script>

<template>
  <div id="mircle-view">
    <canvas id="mircle"></canvas>
  </div>
</template>

<style>
#mircle-view {
  height: 100vh;
  width: 100vh;
}
#mircle {
  width: 100%;
  height: 100%;
}
</style>
