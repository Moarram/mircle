<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import ProgressBar from '@/components/ProgressBar.vue'
import { store } from '@/store';
import { createMircle } from '@/mircle/mircle'

defineExpose({
  render,
  abort,
})

let controller: AbortController | undefined
let canvas: HTMLCanvasElement

const progressPercent = ref<number>()

async function render() {
  store.isRendering = true
  progressPercent.value = 0
  await new Promise(resolve => requestAnimationFrame(resolve))
  controller = new AbortController()
  await createMircle({
    canvas,
    layout: toRaw(store.layout),
    styles: toRaw(store.styles),
    onProgress: p => progressPercent.value = p,
    signal: toRaw(controller.signal)
  })
  controller = undefined
  store.isRendering = false
}

function abort() {
  if (!controller) return
  controller.abort()
}

onMounted(() => {
  canvas = document.getElementById('mircle') as HTMLCanvasElement
})
</script>

<template>
  <div id="mircle-view">
    <canvas id="mircle" :style="{opacity: store.isRendering ? .5 : 1}"/>
    <div id="progress" v-if="store.isRendering">
      <ProgressBar :percent="progressPercent || 0" />
    </div>
  </div>
</template>

<style>
#mircle-view {
  height: 100vh;
  width: 100vh;
  position: relative;
}
#mircle {
  width: 100%;
  height: 100%;
  display: block;
}
#progress {
  width: 20rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
