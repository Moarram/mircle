<template>
  <canvas id="main-canvas"></canvas>
</template>

<script>
import MCircle from '@/modules/mcircle.js'

export default {
  name: 'TheCircle',
  props: {
    mod: Number,
    mult: Number,
    opts: Object,
  },
  data() {
    return {
      circle: null,
    }
  },
  watch: {
    mod(val) { this.circle.mod = val },
    mult(val) { this.circle.mult = val },
    opts: {
      handler(val) { this.circle.opts = val },
      deep: true,
    },
  },
  mounted() {
    const canvas = document.getElementById('main-canvas')
    const ctx = canvas.getContext('2d', { alpha: false })
    
    const resize = () => {
      canvas.width = canvas.clientWidth * this.ratio
      canvas.height = canvas.clientHeight * this.ratio
    }
    window.addEventListener('resize', resize)
    resize()
    
    this.circle = new MCircle(ctx, this.mod, this.mult, undefined, this.opts)
    this.circle.draw()
  },
  computed: {
    ratio() {
      return window.devicePixelRatio || 1
    },
  },
}
</script>

<style lang="scss">
  #main-canvas {
    width: 100%;
    height: 100%;
  }
</style>