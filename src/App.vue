<script setup>
import { ref } from 'vue'
import TheMircle from '@/components/TheMircle.vue'

const message = ref("")
</script>

<template>
  <div style="margin: auto;">
    <div style="position: fixed; top: 0">{{ message }}</div>
    <TheMircle @progress="msg => message = msg"/>
  </div>
</template>

<style lang="scss">
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
