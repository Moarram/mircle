<template>
  <div id="controls">
    <div v-if="show.menu" id="menu">
      <div>[<span class="kb">M</span>] Menu <span style="color: #FFF8">(use keyboard)</span></div>
      <!-- <BaseButton
        color-group="math"
        @click="show.mathOpts = !show.mathOpts"
      >
        Arrangement
      </BaseButton>
      <BaseButton
        color-group="anim"
        @click="show.animateOpts = !show.animateOpts"
      >
        Animation
      </BaseButton>
      <BaseButton
        color-group="disp"
        @click="show.displayOpts = !show.displayOpts"
      >
        Appearance
      </BaseButton> -->
      <div id="fps"><span class="val">{{ fps }}</span>&nbsp;FPS</div>
    </div>
    <div v-if="show.opts && show.mathOpts" id="data-controls">
      <div>[<span class="kb">[</span>/<span class="kb">]</span>] # of lines:&nbsp;<span class="right val">{{ mod }}</span></div>
      <div>[<span class="kb">←</span>/<span class="kb">→</span>] multiple:&nbsp;<span class="right val">{{ multRounded }}</span></div>
    </div>
    <div v-if="show.opts && show.animateOpts" id="anim-controls">
      <div>[<span class="kb">Space</span>] animating:&nbsp;<span class="right val">{{ run }}</span></div>
      <div>[<span class="kb">↑</span>/<span class="kb">↓</span>] delta:&nbsp;<span class="right val">{{ delta }}</span></div>
      <div>[<span class="kb">R</span>] reverse</div>
    </div>
    <div v-if="show.opts && show.displayOpts" id="disp-controls">
      <div>[<span class="kb">L</span>] line width:&nbsp;<span class="right val">{{ opts.lineWidth }}</span></div>
      <div>... opacity:&nbsp;<span class="right val">{{ opts.lineAlpha }}</span></div>
      <div>[<span class="kb">D</span>] draw order:&nbsp;<span class="right val">{{ opts.drawOrder }}</span></div>
      <div>[<span class="kb">C</span>] color mode:&nbsp;<span class="right val">{{ opts.colorMode || 'none' }}</span></div>
      <div>[<span class="kb">A</span>] opacity mode:&nbsp;<span class="right val">{{ opts.alphaMode || 'none' }}</span></div>
      <div>... blurring:&nbsp;<span class="right val">{{ opts.trails }}</span></div>
      <div>[<span class="kb">=</span>/<span class="kb">-</span>] resolution:&nbsp;<span class="right val">{{ opts.ratio }}x</span></div>
      <div>[<span class="kb">Z</span>] zoom:&nbsp;<span class="right val">{{ opts.zoom }}x</span></div>
    </div>
  </div>
</template>

<script>
import * as U from '@/modules/utils.js'

import BaseButton from '@/components/BaseButton.vue'

export default {
  name: 'TheControls',
  components: {
    BaseButton,
  },
  props: {
    mod: Number,
    mult: Number,
    delta: Number,
    opts: Object,
    run: Boolean,
    fps: Number,
  },
  emits: [
    'update:mod',
    'update:mult',
    'update:delta',
    'update:opts', 
    'update:run',
  ],
  data() {
    return {
      show: {
        menu: true,
        opts: false,
        mathOpts: true,
        animateOpts: true,
        displayOpts: true,
      },
      choices: {
        mod: [10, 50, 100, 200, 400, 800, 1600, 3200, 6400],
        delta: [-1, -.4, -.2, -.1, -.04, -.02, -.01, -.004, -.002, -.001, .001, .002, .004, .01, .02, .04, .1, .2, .4, 1],
        lineWidth: [.5, 1, 2, 3, 5],
        lineAlpha: [.1, .2, .3, .4, .5, .6, .7, .8, .9, 1],
        drawOrder: ['short', 'long', 'fast', 'slow'],
        colorMode: ['short', 'long', 'fast', 'slow', null],
        alphaMode: [null, 'short', 'long', 'fast', 'slow'],
        trails: [0, .3, .7, .9, 1],
        ratio: [.1, .25, .5, 1, 2, 3, 4],
        zoom: [1, 2, 5, 10],
      },
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
  },
  computed: {
    multRounded() {
      const num = U.math.round(this.mult, 4)
      const [int, dec] = num.toString().split('.')
      return `${int}.${dec ? dec.padEnd(4, '0') : '0000'}`
    }
  },
  methods: {
    handleKeydown(key) {
      const nextOpt = (key, mode, wrap) => {
        this.$emit('update:opts', { ...this.opts, [key]: this.seek(this.opts[key], this.choices[key], mode, wrap) })
      }
      switch (key.key) {
        case 'm': this.show.opts = !this.show.opts; break
        case ' ': this.$emit('update:run', !this.run); break
        case 'r': this.$emit('update:delta', -this.delta); break
        case ']': this.$emit('update:mod', this.seek(this.mod, this.choices.mod, '+')); break
        case '[': this.$emit('update:mod', this.seek(this.mod, this.choices.mod, '-')); break
        case 'd': nextOpt('drawOrder'); break
        case 'c': nextOpt('colorMode'); break
        case 'a': nextOpt('alphaMode'); break
        case 'z': nextOpt('zoom', '+', true); break
        case 'l': nextOpt('lineWidth', '+', true); break
        case '=': nextOpt('ratio', '+'); break
        case '-': nextOpt('ratio', '-'); break
        case 'ArrowUp': this.$emit('update:delta', this.seek(this.delta, this.choices.delta, '+')); break
        case 'ArrowDown': this.$emit('update:delta', this.seek(this.delta, this.choices.delta, '-')); break
        case 'ArrowLeft': this.$emit('update:mult', Math.ceil(this.mult) - ((this.run && Math.sign(this.delta) > 0) ? 2 : 1)); break
        case 'ArrowRight': this.$emit('update:mult', Math.floor(this.mult) + ((this.run && Math.sign(this.delta) < 0) ? 2 : 1)); break
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
#controls {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: space-around;
}
#menu {
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  background: #000C;

  > * {
    margin: .5rem;
  }
}

#anim-controls,
#data-controls,
#disp-controls {
  min-width: 20vw;
  padding: .5rem;
  display: flex;
  flex-flow: column;
  border-top: 1px solid #FFF4;
  background: #000C;
}


.right {
  float: right;
}
.val {
  font-weight: bold;
  color: #DB5;
}
.kb {
  font-weight: bold;
  color: #5BD;
}
.row {
  display: flex;
  flex-flow: row wrap;
}
</style>