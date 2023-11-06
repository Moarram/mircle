<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import TheMircle from '@/components/TheMircle.vue'
import type { Progress } from '@/types';
import type { LayoutMircleArgs } from './mircle/layout';
import type { StyleMircleConfig } from './mircle/mircle';

const mircle = ref<InstanceType<typeof TheMircle> | null>(null)

const messages = reactive<string[]>([])
const lastTime = ref<number>(Date.now())

const layout = reactive<LayoutMircleArgs>({
  modulo: 700,
  multiple: undefined,
  size: 5000,
  padding: 50,
})

const config = reactive<StyleMircleConfig>({
  lines: {},
  background: {},
})

function handleProgress({ message, current, total }: Progress) {
  const report = (message: string) => {
    const currentTime = Date.now()
    messages.push(`${message} ${currentTime - lastTime.value}ms`)
    lastTime.value = Date.now()
  }
  if (!total) {
    report(message)
  } else {
    report(`${message} (${current}/${total})`)
  }
}

onMounted(() => {
  window.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      mircle.value?.render()
    }
    if (event.key === 'Escape') {
      mircle.value?.abort()
    }
  })
})

</script>

<template>
  <main>
    <TheMircle ref="mircle" @progress="handleProgress" :layout="layout" :config="config" />
    <div style="font-size: 10px;">
      <div v-for="(message, i) in messages" :key="i">
        {{ message }}
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-flow: row wrap;
}
</style>

<style>
body {
  margin: 0;
  background: black
}
#app {
  font-family: Courier, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #DDD;
  margin: 0;
  padding: 0;
  background: #070707;
}
</style>
