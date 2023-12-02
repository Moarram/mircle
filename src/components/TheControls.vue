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
      :style="store.isRendering ? 'color: #B00' : ''"
      :large="true"
      class="ctrl"
    />
    <BaseButton
      @click="emit('download')"
      :disabled="store.isRendering || store.isDownloading"
      :large="true"
      class="ctrl"
      content="Download"
    />
    <div class="ctrl">
      <BaseCheckbox
        id="auto-render"
        v-model="store.options.autoRender"
      />
      <label for="auto-render">Auto-render</label>
    </div>
    <div class="ctrl">
      <BaseCheckbox
        id="invert"
        v-model="store.options.invert"
      />
      <label for="invert">Invert</label>
    </div>
  </div>
</template>

<style scoped>
#controls {
  margin-right: -.5rem;
  margin-bottom: -.5rem;
  padding: .5rem;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}
.ctrl {
  margin-right: .5rem;
  margin-bottom: .5rem;
}
</style>