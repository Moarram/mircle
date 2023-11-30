<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
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

const isError = ref<boolean>()

async function render() {
  if (store.isRendering) return // TODO manage initial color updates better
  store.isRendering = true
  store.renderProgress = 0
  isError.value = false
  await delayFrames(1) // give ui a chance to update
  controller = new AbortController()
  try {
    await createMircle({
      canvas,
      layout: toRaw(store.layout),
      styles: toRaw(store.styles),
      invert: store.options.invert,
      onProgress: p => store.renderProgress = p,
      signal: toRaw(controller.signal)
    })
  } catch (err) {
    console.error(err)
    isError.value = true
  }
  controller = undefined
  store.isRendering = false
  // await delayFrames(60)
  // store.layout.modulo += 1
  // render()
}

function abort() {
  controller?.abort()
}

async function download() {
  store.isDownloading = true
  await delayFrames(1) // give ui a chance to update
  const mult = store.layout.multiple ? `x${store.layout.multiple}` : ''
  const filename = `mircle${store.layout.modulo}${mult}.png`
  await downloadCanvas(canvas, filename)
  store.isDownloading = false
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
  width: 100%;
  position: relative;
}

#mircle {
  width: 100%;
  height: 100%;
  display: block;
}

#err {
  color: #F55A;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.hide {
  display: none;
}
</style>
