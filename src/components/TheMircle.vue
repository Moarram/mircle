<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useStore } from '@/store';
import { createMircle } from '@/mircle/createMircle'
import { AbortError, delayFrames, downloadCanvas } from '@/utils';

defineExpose({
  abort,
  download,
  render,
  rerender,
})

const store = useStore()

let controller: AbortController | undefined
let canvas: HTMLCanvasElement

const isError = ref<boolean>()

// Cancel an ongoing render
function abort() {
  controller?.abort()
}

// Download the canvas contents
async function download() {
  store.activity = 'download'
  await delayFrames(1) // give ui a chance to update
  const mod = store.specification.modulo
  const mult = store.specification.multiple ? `-layer${store.specification.multiple}` : ''
  const style = store.specification.style === 'plain' ? '-plain' : ''
  const filename = `mircle${mod}${mult}${style}.png`
  await downloadCanvas(canvas, filename)
  store.activity = null
}

// Render the mircle
async function render() {
  store.activity = 'render'
  store.renderProgress = 0
  isError.value = false

  controller = new AbortController()

  try {
    await createMircle({
      canvas,
      specification: toRaw(store.specification),
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
  store.activity = null
}

// Cancel any ongoing render and then render again
async function rerender() {
  if (store.activity === 'render') abort()
  await delayFrames(1) // give ui a chance to update
  if (store.activity !== 'download') render()
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
      <div v-if="store.specification.size > 4000">(Image is probably too large)</div>
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
