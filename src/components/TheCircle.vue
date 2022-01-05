<template>
  <canvas id="main-canvas"></canvas>
</template>

<script>
import MCircle from '@/modules/mcircle.js'

export default {
  name: 'TheCircle',
  props: {
    run: Boolean,
    mod: Number,
    mult: Number,
    delta: Number,
    opts: Object,
  },
  emits: [
    'update:mult',
    'update:fps',
  ],
  data() {
    return {
      circle: null,
    }
  },
  watch: {
    mod(val) { this.circle.mod = val },
    mult(val) { this.circle.mult = val },
    delta(val) { this.circle.delta = val },
    opts: {
      handler(val) { this.circle.opts = val },
      deep: true,
    },
    run(val) {
      this.circle.run = val
      if (!val) { // stopping
        this.$emit('update:mult', this.circle.mult)
      }
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
    
    this.circle = new MCircle(ctx, this.mod, this.mult, this.delta, this.opts)
    this.circle.draw()

    window.setInterval(() => {
      if (this.run) {
        this.$emit('update:fps', this.circle.fps)
      }
    }, 1000)

    if (this.run) this.circle.start()
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