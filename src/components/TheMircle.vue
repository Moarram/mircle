<template>
  <div id="mircle-view">
    <canvas id="mircle"></canvas>
  </div>
</template>

<script>
import { draw } from '@moarram/util'
import { drawMircle, drawMircleFamily, createMircleFamily } from '../modules/mircle'

export default {
  name: 'TheMircle',
  components: {},
  mounted() {
    this.canvas = document.getElementById('mircle')
    const abort = createMircleFamily({
      canvas: this.canvas,
      modulo: 234,
      size: 10000,
    })
    // TODO refactor component to use composition api (instead of options api)
    // REF https://vuejs.org/guide/introduction.html#api-styles

    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') abort()
    })
  },
}
</script>

<style lang="scss">
#mircle-view {
  height: 100vh;
  width: 100vh;
}
#mircle {
  width: 100%;
  height: 100%;
}
</style>
