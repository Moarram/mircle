<template>
  <div id="view-circle">
    <TheCircle
      :mod="params.mod"
      :mult="params.mult"
      :opts="opts"
      style="position: absolute; top: 0"
    />
    <TheControls
      :mod="params.mod"
      :mult="params.mult"
      :delta="params.delta"
      :opts="opts"
      :run="run"
      :fps="frame.fps"
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
      params: {
        mod: 200,
        mult: 2,
        delta: .001,
      },
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
      choices: {
        mod: [10, 50, 100, 200, 400, 800, 1600, 3200, 6400],
        delta: [-.01, -.004, -.002, -.001, -.0004, -.0002, -.0001, .0001, .0002, .0004, .001, .002, .004, .01],
        lineWidth: [.5, 1, 2, 3, 5],
        lineAlpha: [.1, .2, .3, .4, .5, .6, .7, .8, .9, 1],
        drawOrder: ['short', 'long', 'fast', 'slow'],
        colorMode: ['short', 'long', 'fast', 'slow', null],
        alphaMode: [null, 'short', 'long', 'fast', 'slow'],
        trails: [0, .3, .6, .8, .9, 1],
        ratio: [.1, .25, .5, 1, 2, 3, 4],
        zoom: [1, 2, 5, 10],
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

    window.addEventListener('keydown', this.handleKeydown)

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
      this.params.mult += this.params.delta
    },
    handleKeydown(key) {
      switch (key.key) {
        case ' ': (this.run) ? this.stop() : this.start(); break
        case 'r': this.params.delta = -this.params.delta; break
        case ']': this.params.mod = this.seek(this.params.mod, this.choices.mod, '+'); break
        case '[': this.params.mod = this.seek(this.params.mod, this.choices.mod, '-'); break
        case 'd': this.opts.drawOrder = this.seek(this.opts.drawOrder, this.choices.drawOrder); break
        case 'c': this.opts.colorMode = this.seek(this.opts.colorMode, this.choices.colorMode); break
        case 'a': this.opts.alphaMode = this.seek(this.opts.alphaMode, this.choices.alphaMode); break
        case 'z': this.opts.zoom = this.seek(this.opts.zoom, this.choices.zoom, '+', true); break
        case 'l': this.opts.lineWidth = this.seek(this.opts.lineWidth, this.choices.lineWidth, '+', true); break
        case '=': this.opts.ratio = this.seek(this.opts.ratio, this.choices.ratio, '+'); break
        case '-': this.opts.ratio = this.seek(this.opts.ratio, this.choices.ratio, '-'); break
        case 'ArrowUp': this.params.delta = this.seek(this.params.delta, this.choices.delta, '+'); break
        case 'ArrowDown': this.params.delta = this.seek(this.params.delta, this.choices.delta, '-'); break
        case 'ArrowLeft': this.params.mult = Math.ceil(this.params.mult) - ((this.run && Math.sign(this.params.delta) > 0) ? 2 : 1); break
        case 'ArrowRight': this.params.mult = Math.floor(this.params.mult) + ((this.run && Math.sign(this.params.delta) < 0) ? 2 : 1); break
      }
    },
    seek(val, choices, mode='+', wrap=false) {
      if (typeof val !== 'number') {
        const index = choices.indexOf(val)
        if (index === -1) return choices[0]
        if (mode === '+') return choices[(index + 1) % choices.length]
        if (mode === '-') return choices[(index - 1) % choices.length]
      } else {
        if (mode === '+') {
          for (let choice of choices) {
            if (val < choice) return choice
          }
          if (wrap) return choices[0]
        }
        if (mode === '-') {
          const reversed = [...choices].reverse()
          for (let choice of reversed) {
            if (val > choice) return choice
          }
          if (wrap) return reversed[0]
        }
      }
      return val
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
