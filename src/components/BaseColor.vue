<script setup lang="ts">
import { computed } from 'vue'
import { Colorful } from '@moarram/util'
import BaseColorSlider from './BaseColorSlider.vue';

const props = defineProps<{
  modelValue: string,
  onLight?: boolean,
}>()

const emit = defineEmits<{
  'update:modelValue': [val: string]
}>()

const color = computed(() => new Colorful(props.modelValue).toString())
const textColor = computed(() => {
  const background = props.onLight ? '#FFF' : '#000'
  const foreground = new Colorful(color.value)
  const applied = foreground.on(background)
  return applied.isDark() ? '#FFFA' : '#000'
})

function colorStr(color: any) {
  return new Colorful(color).toString()
}

function onChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', colorStr(value))
}

</script>

<template>
  <div class="container">
    <input
      type="text"
      @change="onChange"
      @focus="event => (event.target as HTMLInputElement).select()"
      :value="modelValue"
      :style="{
        background: colorStr(color),
        color: textColor,
      }"
    />
    <!-- <div class="channel">
      <label for="r">R</label>
      <BaseColorSlider
        id="r"
        @change="val => emit('update:modelValue', colorStr({ ...color, r: val * 255 }))"
        :percent="color.r / 255"
        :colors="[
          colorStr({ ...color, r: 0 }),
          colorStr({ ...color, r: 255 }),
        ]"
        :height="15"
        :width="200"
      />
    </div>
    <div class="channel">
      <label for="g">G</label>
      <BaseColorSlider
        id="g"
        @change="val => emit('update:modelValue', colorStr({ ...color, g: val * 255 }))"
        :percent="color.g / 255"
        :colors="[
          colorStr({ ...color, g: 0 }),
          colorStr({ ...color, g: 255 }),
        ]"
        :height="15"
        :width="200"
      />
    </div>
    <div class="channel">
      <label for="b">B</label>
      <BaseColorSlider
        id="b"
        @change="val => emit('update:modelValue', colorStr({ ...color, b: val * 255 }))"
        :percent="color.b / 255"
        :colors="[
          colorStr({ ...color, b: 0 }),
          colorStr({ ...color, b: 255 }),
        ]"
        :height="15"
        :width="200"
      />
    </div>
    <div class="channel">
      <label for="a">A</label>
      <BaseColorSlider
        id="a"
        @change="val => emit('update:modelValue', colorStr({ ...color, a: val }))"
        :percent="color.a"
        :colors="[
          colorStr({ ...color, a: 0 }),
          colorStr({ ...color, a: 1 }),
        ]"
        :height="15"
        :width="200"
      />
    </div> -->
  </div>
</template>

<style scoped>
.container {
  display: block;
}

input {
  max-width: 5.5rem;
  font-size: inherit;
  font-family: inherit;
  border: 1px solid #DDD8;
}

.channel {
  padding: .2rem .5rem;
  display: flex;
  flex-flow: row nowrap;
}
</style>
