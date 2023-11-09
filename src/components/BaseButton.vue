<script setup lang="ts">

const props = defineProps<{
  content: string,
  disabled?: boolean,
}>()

const emit = defineEmits<{
  click: [],
}>()

</script>

<template>
  <input type="button" @click="emit('click')" :disabled="props.disabled" :value="props.content">
</template>

<style scoped>
input {
  font-family: inherit;
  font-size: inherit;
}
</style>