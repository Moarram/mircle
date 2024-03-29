<script setup lang="ts">
import { type } from '@moarram/util'
import BaseButton from './BaseButton.vue';
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number,
  min?: number,
  max?: number,
  step?: number,
  disabled?: boolean,
}>()

const emit = defineEmits<{
  'update:modelValue': [val: number]
}>()

const digits = computed(() => `${Math.max(props.modelValue, (props?.max || 10000) - (props?.step || 0 ))}`.length)

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
      :disabled="props.disabled || props.min !== undefined && props.modelValue <= props.min"
      :square-right="true"
    />
    <input
      type="number"
      :style="{maxWidth: `${digits * .62}em`}"
      :value="props.modelValue"
      @change="onChange"
      @focus="event => (event.target as HTMLInputElement).select()"
      :disabled="props.disabled"
    />
    <BaseButton
      v-if="props.step"
      content="+"
      @click="emit('update:modelValue', constrain(props.modelValue + props.step))"
      :disabled="props.disabled || props.max !== undefined && props.modelValue >= props.max"
      :square-left="true"
    />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
}
input {
  margin-top: 3px;
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
  font-family: inherit;
  font-size: inherit;
  color: #000D;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
</style>