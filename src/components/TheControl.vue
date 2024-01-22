<script setup lang="ts">
import { storeToRefs} from 'pinia'
import { computed, ref, watch } from 'vue';
import { useStore } from '@/store'
import { group, primeFactors } from '@/utils';
import BaseButton from './BaseButton.vue';
import BaseCheckbox from './BaseCheckbox.vue';
import BaseNumber from './BaseNumber.vue';

const store = useStore()

const factorsHtml = computed(() => {
  const factors = primeFactors(store.specification.modulo)
  if (!factors.length) return ['']
  const grouped = group(factors, n => n)
  const powered = [...grouped.entries()].map(([factor, items]) => items.length > 1 ? `${factor}<sup>${items.length}</sup>` : factor)
  return `= ${powered.join('\u200B×')}`
})

const localMultiple = ref(2)
const expanded = ref(false)

function setMultiple(val: number) {
  localMultiple.value = val // TODO stop getting confused by this local variable
  store.multiple = val
}

watch([storeToRefs(store).modulo], () => {
  if (localMultiple.value > store.modulo) {
    localMultiple.value = store.modulo
  }
})

const emit = defineEmits<{
  render: [],
  abort: [],
  download: [],
}>()
</script>

<template>
  <div style="
    display: flex;
    flex-flow: column;
    align-items: stretch;
    border: 1px solid #333;
    border-radius: calc(1rem + 3px);
  ">
    <!-- Vertices -->
    <div style="
      padding: 1rem;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    ">
      <div class="row" title="The number of points around the circle">
        <label for="modulo">Vertices:</label>
        <BaseNumber
          id="modulo"
          :model-value="store.specification.modulo"
          @update:model-value="val => store.modulo = val"
          :min="0"
          :max="store.multiple === 'all' ? 999 : 99999"
          :step="1"
        />
        <div class="detail" title="Prime factorization" style="min-width: 8rem;" v-html="factorsHtml"></div>
      </div>
      <BaseButton
        content="Options"
        :title="expanded ? 'Hide options' : 'More options'"
        @click="expanded = !expanded"
        :engaged="expanded"
        style="margin-left: .5rem"
      />
    </div>

    <!-- Options -->
    <div v-if="expanded" style="
      padding: 1rem;
      background: #FFF1;
      border-top: 1px solid #333;
    ">
      <div class="row" title="Optionally show a single layer (instead of all)">
        <BaseCheckbox
          id="do-multiple"
          :model-value="store.multiple !== 'all'"
          @update:model-value="val => !val ? store.multiple = 'all' : store.multiple = localMultiple"
          style="margin: .5rem;"
        />
        <label for="do-multiple" :style="{ color: store.multiple === 'all' ? '#DDD8' : '#FFFC'}">Layer:</label>
        <BaseNumber
          id="multiple"
          :model-value="localMultiple"
          @update:model-value="val => setMultiple(val)"
          :min="0"
          :max="store.specification.modulo"
          :step="1"
          :disabled="store.multiple === 'all'"
        />
        <div class="ctrl" style="margin-left: 1rem;" title="Show labels for vertices">
          <BaseCheckbox
            id="labels"
            v-model="store.labels"
            style="margin: .5rem"
          />
          <label for="labels">Labels</label>
        </div>
      </div>

      <div class="row" style="margin-top: 1rem;">
        <div style="margin-right: .5rem;">Style:</div>
        <div>
          <BaseButton
            content="Fancy"
            @click="store.style = 'fancy'"
            :engaged="store.style === 'fancy'"
            :border-right="true"
            :square-right="true"
          />
          <BaseButton
            content="Plain"
            @click="store.style = 'plain'"
            :engaged="store.style === 'plain'"
            :square-left="true"
          />
        </div>
      </div>

      <div class="row" title="The width and height of the image (it's a square)" style="margin-top: 1rem; max-width: 100%;">
        <label for="size">Image size:</label>
        <div>
          <BaseButton
            content="Auto"
            @click="store.size = 'auto'"
            :engaged="store.size === 'auto'"
            :border-right="true"
            :square-right="true"
          />
          <BaseButton
            content="2000"
            @click="store.size = 2000"
            :engaged="store.size === 2000"
            :border-right="true"
            :square-right="true" :square-left="true"
          />
          <BaseButton
            content="4000"
            @click="store.size = 4000"
            :engaged="store.size === 4000"
            :border-right="true"
            :square-right="true" :square-left="true"
          />
          <BaseButton
            content="10000"
            @click="store.size = 10000"
            :engaged="store.size === 10000"
            :square-left="true"
            style="color: #B00"
          />
        </div>
        <BaseNumber
          id="size"
          :model-value="store.specification.size"
          @update:model-value="val => store.size = val"
          :min="0"
          :max="16384"
          style="margin-left: 1em;"
        />
        <div style="padding-left: .3em;">px</div>
      </div>
    </div>

    <!-- Render -->
    <div style="padding: 1rem; border-top: 1px solid #333;">
      <div class="row">
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
          style="margin-right: 1rem; margin-left: .5rem;"
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
    </div>

  </div>
</template>

<style scoped>
.ctrl {
  user-select: none;
}

.row {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

label {
  margin-right: .5rem;
}

.detail {
  margin-left: .7rem;
  color: #DDD8;
}
</style>