<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import ProgressBar from '@/components/ProgressBar.vue'
import { store } from '@/store';
import { createMircle } from '@/mircle/mircle'

defineExpose({
  render,
  abort,
  download,
})

let controller: AbortController | undefined
let canvas: HTMLCanvasElement

// TODO separate layout, style, and draw progress
// TODO show progress bar as circle
const progressPercent = ref<number>()

async function render() {
  store.isRendering = true
  progressPercent.value = 0
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
  controller?.abort()
}

async function download() {
  store.isDownloading = true
  const blob = await new Promise<Blob|null>(resolve => canvas.toBlob(resolve))
  if (!blob) return // TODO handle instead of silent fail
  const link = document.createElement('a')
  link.download = `mircle${store.layout.modulo}.png`
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href) // cleanup
  store.isDownloading = false
}

onMounted(() => {
  canvas = document.getElementById('mircle') as HTMLCanvasElement
})
</script>

<template>
  <div id="mircle-view">
    <canvas id="mircle" :class="{ rendering: store.isRendering }" />
    <div id="progress" :class="{ rendering: store.isRendering }">
      <ProgressBar :percent="progressPercent || 0" />
    </div>
  </div>
</template>

<style>
#mircle-view {
  height: min(100vw, 100vh);
  width: min(100vw, 100vh);
  position: relative;
}

#mircle {
  width: 100%;
  height: 100%;
  display: block;

  &.rendering {
    display: none;
  }
}

#progress {
  width: 20rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;

  &.rendering {
    display: block;
  }
}
</style>
