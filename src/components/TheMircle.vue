<script setup>
import { draw } from '@moarram/util'
import { createMircleFamily } from '../modules/mircle'
import { onMounted } from 'vue';

const props = defineProps({
  modulo: Number, // The number of points around the Mircle
})

const emit = defineEmits(['progress'])

function onProgress(msg) {
  console.debug(msg)
  emit('progress', msg)
}

onMounted(() => {
  const canvas = document.getElementById('mircle')
  const abort = createMircleFamily({
    canvas,
    modulo: 312,
    size: 2000,
    padding: 50,
    onProgress,
  })

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') abort()
  })
})
</script>

<template>
  <div id="mircle-view">
    <canvas id="mircle"></canvas>
  </div>
</template>

<style lang="scss">
#mircle-view {
  height: 100vh;
  width: 100vh;
}
#mircle {
  width: 100%;
  height: 100%;
}
</style>
