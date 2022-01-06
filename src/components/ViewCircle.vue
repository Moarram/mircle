<template>
  <div id="view-circle">
    <TheCircle
      :mod="mod"
      :mult="mult"
      :opts="opts"
      style="position: absolute; top: 0"
    />
    <TheControls
      v-model:mod="mod"
      v-model:mult="mult"
      v-model:delta="delta"
      v-model:opts="opts"
      :fps="frame.fps"
      :run="run"
      @update:run="onRunChange"

      style="position: absolute; top: 0"
    />
  </div>
</template>

<script>
import TheCircle from '@/components/TheCircle.vue'
import TheControls from '@/components/TheControls.vue'

export default {
  name: 'ViewCircle',
  components: {
    TheCircle,
    TheControls,
  },
  data() {
    return {
      mod: 200,
      mult: 2,
      delta: .1,
      opts: {
        lineWidth: 1,
        lineAlpha: 1,
        drawOrder: 'short',
        colorMode: 'short',
        alphaMode: null,
        trails: 0,
        ratio: window.devicePixelRatio || 1,
        zoom: 1,
      },
      frame: {
        count: 0,
        last: null,
        mspf: 100,
        fps: 0,
      },
      run: false,
    }
  },
  mounted() {
    this.start()

    window.setInterval(() => {
      this.frame.fps = (this.run) ? Math.round(1 / (this.frame.mspf / 1000)) : 0
    }, 250)
  },
  computed: {

  },
  methods: {
    start() {
      if (this.run) return
      this.run = true

      this.frame.count = 0
      this.frame.last = Date.now() - this.frame.mspf

      this.loop()
    },
    stop() {
      this.run = false
    },
    loop() {
      if (!this.run) return

      const now = Date.now()
      const ms = now - this.frame.last
      this.frame.last = now
      this.frame.mspf = (this.frame.mspf * (5 - 1) + ms) / 5
      this.frame.count += 1

      this.step()
      window.requestAnimationFrame(() => this.loop())
    },
    step() {
      this.mult += this.delta * .01
    },
    onOptChange(event) {
      console.debug(event)
      const { key, val } = event
      this.opts[key] = val
    },
    onRunChange(event) {
      return (event) ? this.start() : this.stop()
    },
  }
}
</script>

<style lang="scss">
#view-circle {
  width: 100%;
  height: calc(100vh - 1px);
  position: relative;
}
</style>
