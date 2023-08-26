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
      canvas: null,
      circle: null,
    }
  },
  watch: {
    mod(val) { this.circle.mod = val },
    mult(val) { this.circle.mult = val },
    opts: {
      handler(val) {
        this.circle.opts = val
        this.resize()
      },
      deep: true,
    },
  },
  mounted() {
    this.canvas = document.getElementById('main-canvas')
    const ctx = this.canvas.getContext('2d', { alpha: false })
    
    window.addEventListener('resize', () => this.resize())
    // window.setInterval(() => this.resize(), 1000) // doesn't work?
    this.resize()
    
    this.circle = new MCircle(ctx, this.mod, this.mult, undefined, this.opts)
    this.circle.draw()
  },
  computed: {
    ratio() {
      return this.opts.ratio || window.devicePixelRatio || 1
    },
  },
  methods: {
    resize() {
      this.canvas.width = this.canvas.clientWidth * this.ratio
      this.canvas.height = this.canvas.clientHeight * this.ratio
      if (this.circle) this.circle.redraw()
    }
  }
}
</script>

<style lang="scss">
  #main-canvas {
    width: 100%;
    height: 100%;
  }
</style>