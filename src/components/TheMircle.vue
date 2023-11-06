<script setup lang="ts">
import { onMounted, toRaw } from 'vue';
import type { Progress } from '@/types';
import type { LayoutMircleArgs } from '@/mircle/layout';
import { createMircle, type StyleMircleConfig } from '@/mircle/mircle'

const props = defineProps<{
  layout: LayoutMircleArgs,
  config: StyleMircleConfig,
}>()

const emit = defineEmits<{
  progress: [progress: Progress]
}>()

defineExpose({
  render,
  abort,
})

let controller: AbortController
let canvas: HTMLCanvasElement

async function render() {
  controller = new AbortController()
  await createMircle({
    canvas,
    layout: toRaw(props.layout),
    styles: toRaw(props.config),
    onProgress,
    signal: controller.signal
  })
}

function abort() {
  if (!controller) return
  controller.abort()
}

function onProgress(progress: Progress) {
  emit('progress', progress)
}

onMounted(() => {
  canvas = document.getElementById('mircle') as HTMLCanvasElement
})
</script>

<template>
  <div id="mircle-view">
    <canvas id="mircle"/>
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
