<template>
  <div id="main">
    <TheCircle
      :run="true"
      :mod="300"
      :mult="2"
      :delta=".05"
      :opts="{
        lineWidth: 1,
        drawOrder: 'fast',
        colorMode: 'fast',
      }"
    />
    <TheControls

    />
  </div>
</template>

<script>
import TheCircle from '@/components/TheCircle.vue'
import TheControls from '@/components/TheControls.vue'

export default {
  name: 'App',
  components: {
    TheCircle,
    TheControls,
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  background: black
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  background: rgb(22, 22, 22);
}
#main {
  width: 100%;
  height: 95vh;
}
</style>
