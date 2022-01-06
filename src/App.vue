<template>
  <ViewCircle/>
</template>

<script>
import ViewCircle from '@/components/ViewCircle.vue'

export default {
  name: 'App',
  components: {
    ViewCircle,
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
  background: #111;
}
</style>
