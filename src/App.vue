<script setup lang="ts">
import { reactive, ref } from 'vue';
import TheMircle from './components/TheMircle.vue'
import type { Progress } from './modules/types';

const messages = reactive<string[]>([])
const lastTime = ref<number>(Date.now())

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

</script>

<template>
  <main>
    <TheMircle @progress="handleProgress"/>
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
