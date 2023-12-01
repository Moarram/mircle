<script setup lang="ts">
import { math } from '@moarram/util'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  percent: number, // amount along slider in range [0..1]
  colors: string[], // colors used to create gradient
  height: number,
  width: number,
}>()

const emit = defineEmits<{
  'input': [val: number], // fired on each mousemove
  'change': [val: number], // fired on mouseup
}>()

const canvas = ref<HTMLCanvasElement>()
const isVertical = computed(() => props.height > props.width)
const isMousePressed = ref<boolean>(false)

const localPercent = ref<number>(props.percent)
const selectedPercent = computed(() => isMousePressed.value ? localPercent.value : props.percent)

watch([
  () => props.colors,
  () => props.width,
  () => props.height,
], render)

function render() {
  if (!canvas.value) return
  canvas.value.width = props.width
  canvas.value.height = props.height
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return
  const gradient =  ctx.createLinearGradient(0, 0, isVertical.value ? 0 : props.width, isVertical.value ? props.height : 0)
  props.colors.forEach((color, i) => {
    const offset = i / (props.colors.length - 1)
    gradient.addColorStop(offset, color)
  })
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, props.width, props.height)
}

function computePercent(event: MouseEvent) {
  if (!canvas.value) return 0
  const { top, left } = canvas.value.getBoundingClientRect()
  if (isVertical.value) {
    const offset = math.clamp(event.clientY - top, 0, props.height)
    return math.round(offset / props.height, 3)
  } else {
    const offset = math.clamp(event.clientX - left, 0, props.width)
    return math.round(offset / props.width, 3)
  }
}

function onMouseDown(event: MouseEvent) {
  isMousePressed.value = true
  localPercent.value = computePercent(event)
  emit('input', localPercent.value)
}

function onMouseMove(event: MouseEvent) {
  if (!isMousePressed.value) return
  localPercent.value = computePercent(event)
  emit('input', localPercent.value)
}

function onMouseUp(event: MouseEvent) {
  if (!isMousePressed.value) return
  emit('change', computePercent(event))
  isMousePressed.value = false
}

onMounted(() => {
  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('mousemove', onMouseMove)
  render()
})
onUnmounted(() => {
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div class="slider" @mousedown="onMouseDown">
    <canvas ref="canvas" />
    <div
      class="handle"
      :style="{
        width: isVertical ? `${width + 6}px` : '.2rem',
        height: isVertical ? '.2rem' : `${height + 6}px`,
        top: `${isVertical ? selectedPercent * height : -3}px`,
        left: `${isVertical ? -3 : selectedPercent * width}px`,
      }"
    ></div>
  </div>
</template>

<style scoped>
.slider {
  position: relative;
  margin: .2rem;
}

canvas {
  display: block;
}

.handle {
  position: absolute;
  background: #FFF;
  box-shadow: 0 0 5px 5px #0002;
}

</style>
