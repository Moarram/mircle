<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import ProgressBar from '@/components/ProgressBar.vue'
import { store } from '@/store';
import { createMircle } from '@/mircle/mircle'
import { delayFrames, downloadCanvas } from '@/utils';

defineExpose({
  render,
  abort,
  download,
})

let controller: AbortController | undefined
let canvas: HTMLCanvasElement

// TODO separate layout, style, and draw progress
// TODO show progress bar as circle

const isError = ref<boolean>()
const progressPercent = ref<number>()

async function render() {
  store.isRendering = true
  isError.value = false
  progressPercent.value = 0
  controller = new AbortController()
  try {
    await createMircle({
      canvas,
      layout: toRaw(store.layout),
      styles: toRaw(store.styles),
      onProgress: p => progressPercent.value = p,
      signal: toRaw(controller.signal)
    })
  } catch (err) {
    isError.value = true
  }
  controller = undefined
  store.isRendering = false
}

function abort() {
  controller?.abort()
}

async function download() {
  store.isDownloading = true
  await delayFrames(2) // give ui a chance to update
  await downloadCanvas(canvas, `mircle${store.layout.modulo}.png`)
  store.isDownloading = false
}

onMounted(() => {
  canvas = document.getElementById('mircle') as HTMLCanvasElement
})
</script>

<template>
  <div id="mircle-view">
    <canvas id="mircle" :class="{ rendering: store.isRendering || isError }" />
    <div v-if="store.isRendering" id="progress" class="center">
      <ProgressBar :percent="progressPercent || 0" />
    </div>
    <div v-if="isError" id="err" class="center">
      <div>ERROR</div>
      <div v-if="store.layout.size > 4000">(Image is probably too large)</div>
    </div>
  </div>
</template>

<style>
#mircle-view {
  height: 100%;
  width: 100%;
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
}

#err {
  color: #F55;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
</style>
