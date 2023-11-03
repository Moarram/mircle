<script setup lang="ts">
import { createMircle, createMircleFamily } from '../modules/mircle'
import { onMounted } from 'vue';

const props = defineProps({
  modulo: Number, // The number of points around the Mircle
})

const emit = defineEmits(['progress'])

function onProgress(message: string) {
  console.debug(`[mircle] ${message}`)
  emit('progress', message)
}

onMounted(() => {
  const canvas = document.getElementById('mircle') as HTMLCanvasElement
  // createMircle({
  //   canvas,
  //   modulo: 1000,
  //   multiple: 6,
  //   size: 5000,
  //   padding: 50,
  //   onProgress,
  // })
  createMircleFamily({
    canvas,
    modulo: 356,
    size: 1000,
    padding: 50,
    onProgress,
  })

  window.addEventListener('keydown', event => {
    // if (event.key === 'Escape') abort()
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
