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
      @click="store.activity === 'render' ? emit('abort') : emit('render')"
      :disabled="store.activity === 'download'"
      :content="store.activity === 'render' ? 'Cancel' : 'Render'"
      :style="store.activity === 'render' ? 'color: #B00' : ''"
      :large="true"
      class="ctrl"
    />
    <BaseButton
      @click="emit('download')"
      :disabled="store.activity === 'render' || store.activity === 'download'"
      :large="true"
      class="ctrl"
      content="Download"
    />
    <div class="ctrl">
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