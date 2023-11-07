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
  <input type="button" @click="emit('click')" :disabled="disabled" :value="content">
</template>

<style scoped>

</style>