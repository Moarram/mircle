<script setup lang="ts">
import { type } from '@moarram/util'
import BaseButton from './BaseButton.vue';
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number,
  min?: number,
  max?: number,
  step?: number,
}>()

const emit = defineEmits<{
  'update:modelValue': [val: number]
}>()

const digits = computed(() => `${Math.max(props.modelValue, (props?.max || 10000) + (props?.step || 0 ))}`.length)

function constrain(num: number): number {
  if (!type.isNum(num)) return 0
  if (props.min !== undefined) num = Math.max(num, props.min)
  if (props.max !== undefined) num = Math.min(num, props.max)
  return num
}

function onChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  const num = parseInt(value)
  emit('update:modelValue', constrain(num))
}
</script>

<template>
  <div class="container">
    <BaseButton
      v-if="props.step"
      content="-"
      @click="emit('update:modelValue', constrain(props.modelValue - props.step))"
    />
    <input
      type="number"
      :style="{maxWidth: `${digits * .6}em`}"
      :value="props.modelValue"
      @change="onChange"
      @focus="event => (event.target as HTMLInputElement).select()"
    />
    <BaseButton
      v-if="props.step"
      content="+"
      @click="emit('update:modelValue', constrain(props.modelValue + props.step))"
    />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-flow: row nowrap;
}
input {
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
  font-family: inherit;
  font-size: inherit;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
</style>