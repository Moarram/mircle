<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TheMircle from '@/components/TheMircle.vue'

const mircle = ref<InstanceType<typeof TheMircle> | null>(null)

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
    <TheMircle ref="mircle"/>
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
