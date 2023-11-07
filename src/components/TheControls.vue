<script setup lang="ts">
import { store } from '@/store'
import BaseButton from './BaseButton.vue';

const emit = defineEmits<{
  render: [],
  abort: [],
  download: [],
}>()

</script>

<template>
  <div id="controls">
    <BaseButton
      @click="store.isRendering ? emit('abort') : emit('render')"
      :disabled="store.isDownloading"
      :content="store.isRendering ? 'Cancel' : 'Render'"
      class="btn"
    />
    <BaseButton
      @click="emit('download')"
      :disabled="store.isRendering || store.isDownloading"
      content="Download"
      class="btn"
    />
  </div>
</template>

<style scoped>
.btn {
  margin: .2rem;
}
</style>