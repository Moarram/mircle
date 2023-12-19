<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { store } from '@/store';
import { createMircle } from '@/mircle/mircle'
import { AbortError, delayFrames, downloadCanvas } from '@/utils';

defineExpose({
  abort,
  download,
  render,
  rerender,
})

let controller: AbortController | undefined
let canvas: HTMLCanvasElement

const isError = ref<boolean>()

// TODO track down bugs in Safari (gradient & line width incompatible, no bitmap over 3840px)

// Cancel an ongoing render
function abort() {
  controller?.abort()
}

// Download the canvas contents
async function download() {
  store.isDownloading = true
  await delayFrames(1) // give ui a chance to update
  const mult = store.layout.multiple ? `x${store.layout.multiple}` : ''
  const filename = `mircle${store.layout.modulo}${mult}.png`
  await downloadCanvas(canvas, filename)
  store.isDownloading = false
}

// Render the mircle
async function render() {
  store.isRendering = true
  store.renderProgress = 0
  isError.value = false

  controller = new AbortController()

  try {
    const layout = toRaw(store.layout)
    await createMircle({
      canvas,
      specification: {
        ...layout,
        padding: layout.size / 100, // 1% margin
      },
      onProgress: p => store.renderProgress = p,
      signal: toRaw(controller.signal)
    })

  } catch (err) {
    if (err instanceof AbortError) {
      //...
    } else {
      console.error(err)
      isError.value = true
    }
  }

  controller = undefined
  store.isRendering = false
}

// Cancel any ongoing render and then render again
async function rerender() {
  if (store.isRendering) abort()
  await delayFrames(1) // give ui a chance to update
  if (!store.isDownloading) render()
}

onMounted(() => {
  canvas = document.getElementById('mircle') as HTMLCanvasElement
})
</script>

<template>
  <div id="mircle-view">
    <canvas id="mircle" :class="{ hide: isError }" />
    <div v-if="isError" id="err" class="center">
      <div>ERROR</div>
      <div v-if="store.layout.size > 4000">(Image is probably too large)</div>
    </div>
  </div>
</template>

<style>
#mircle-view {
  height: 100%;
  margin: auto;
  position: relative;
  aspect-ratio: 1;
}

#mircle {
  width: 100%;
  height: 100%;
  display: block;

  &.hide {
    display: none;
  }
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
