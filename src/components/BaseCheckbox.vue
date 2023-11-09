<script setup lang="ts">

const props = defineProps<{
  modelValue: boolean,
  disabled?: boolean,
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()

function onChange() {
  emit('update:modelValue', !props.modelValue)
}

</script>

<template>
  <input type="checkbox" @change="onChange" :disabled="props.disabled" :checked="props.modelValue">
</template>

<style scoped>

</style>