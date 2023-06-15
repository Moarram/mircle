<template>
  <div style="margin: auto;">
    <TheMircle/>
  </div>
</template>

<script>
import TheMircle from '@/components/TheMircle.vue'

export default {
  name: 'App',
  components: {
    TheMircle,
  },
}
</script>

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
