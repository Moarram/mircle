<script setup lang="ts">
import { store } from '@/store'
import BaseButton from './BaseButton.vue';
import BaseCheckbox from './BaseCheckbox.vue';

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
    <div>
      <BaseCheckbox
        id="auto-render"
        v-model="store.options.autoRender"
      />
      <label for="auto-render">
        Auto-render
      </label>
    </div>
    <div style="padding-left: .5rem">
      <BaseCheckbox
        id="invert"
        v-model="store.options.invert"
      />
      <label for="invert">
        Invert
      </label>
    </div>
  </div>
</template>

<style scoped>
#controls {
  padding: .5rem;
  display: flex;
  flex-flow: row wrap;
}
.btn {
  margin-right: .5rem;
}
</style>