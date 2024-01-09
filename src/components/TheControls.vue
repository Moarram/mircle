<script setup lang="ts">
import { useStore } from '@/store'
import BaseButton from './BaseButton.vue';
import BaseCheckbox from './BaseCheckbox.vue';

const emit = defineEmits<{
  render: [],
  abort: [],
  download: [],
}>()

const store = useStore()

</script>

<template>
  <div id="controls">
    <BaseButton
      :title="store.activity === 'render' ? 'Cancel ongoing render' : 'Render the image'"
      @click="store.activity === 'render' ? emit('abort') : emit('render')"
      :disabled="store.activity === 'download' || store.autoRender && store.activity !== 'render'"
      :content="store.activity === 'render' ? 'Cancel' : 'Render'"
      :style="store.activity === 'render' ? 'color: #B00' : ''"
      :large="true"
      class="ctrl"
    />
    <BaseButton
      title="Download the image"
      @click="emit('download')"
      :disabled="store.activity === 'render' || store.activity === 'download'"
      :large="true"
      class="ctrl"
      content="Download"
      style="margin-right: 1rem;"
    />
    <div class="ctrl" title="Automatically render whenever options change">
      <BaseCheckbox
        id="auto-render"
        v-model="store.autoRender"
        style="margin: .5rem"
      />
      <label for="auto-render">Auto-render</label>
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
  user-select: none;
}
</style>