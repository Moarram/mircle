<template>
  <div id="controls">
    <div id="menu" :class="{ hide: !show.menu && !show.opts }">
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
    <div v-if="show.opts" id="data-controls">
      <BaseParam key1="[" key2="]" text="# of lines" :val="mod"/>
      <BaseParam key1="←" key2="→" text="multiple" :val="multRounded"/>
    </div>
    <div v-if="show.opts" id="anim-controls">
      <BaseParam key1="Space" text="animating" :val="run"/>
      <BaseParam key1="↑" key2="↓" text="delta" :val="delta"/>
      <BaseParam key1="R" text="reverse"/>
    </div>
    <div v-if="show.opts" id="disp-controls">
      <BaseParam key1="L" text="line width" :val="opts.lineWidth"/>
      <BaseParam key1="O" text="opacity" :val="opts.lineAlpha"/>
      <BaseParam key1="D" text="draw order" :val="opts.drawOrder"/>
      <BaseParam key1="C" text="color mode" :val="opts.colorMode || 'none'"/>
      <BaseParam key1="A" text="opacity mode" :val="opts.alphaMode || 'none'"/>
      <BaseParam key1="B" text="blurring" :val="opts.trails"/>
      <BaseParam key1="=" key2="-" text="resolution" :val="`${opts.ratio}x`"/>
      <BaseParam key1="Z" text="zoom" :val="`${opts.zoom}x`"/>
      <BaseParam key1="I" text="show info" :val="opts.info"/>
    </div>
    <div v-if="show.test" id="test">
      <BaseButton
        :isDisabled="test.toggle"
        :isOn="test.on"
        @click=""
      >
        Test Button
      </BaseButton>
      <BaseButton
        :isOn="test.toggle"
        @click="test.toggle = !test.toggle"
      >
        Toggle
      </BaseButton>
      <BaseButton
        @click="test.on = !test.on"
      >
        On
      </BaseButton>
    </div>
  </div>
</template>

<script>
import * as U from '@/modules/utils.js'

import BaseButton from '@/components/BaseButton.vue'
import BaseParam from '@/components/BaseParam.vue'

export default {
  name: 'TheControls',
  components: {
    BaseButton,
    BaseParam,
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
        test: false,
      },
      choices: {
        mod: [10, 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800],
        delta: [-1, -.4, -.2, -.1, -.04, -.02, -.01, -.004, -.002, -.001, .001, .002, .004, .01, .02, .04, .1, .2, .4, 1],
        lineWidth: [.5, 1, 2, 3, 5],
        lineAlpha: [.1, .3, .7, 1],
        drawOrder: ['short', 'long', 'fast', 'slow'],
        colorMode: ['short', 'long', 'fast', 'slow', null],
        alphaMode: [null, 'short', 'long', 'fast', 'slow'],
        trails: [0, .3, .7, .9, 1],
        ratio: [.1, .25, .5, 1, 2, 3, 4],
        zoom: [1, 2, 5, 10],
      },
      actionTimer: null,
      test: {
        toggle: false,
        on: false,
      }
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('mousemove', this.unhide)
    this.unhide()
  },
  computed: {
    multRounded() {
      return U.math.pad(this.mult % this.mod, 4)
    }
  },
  methods: {
    unhide() {
      this.show.menu = true
      if (this.actionTimer) window.clearTimeout(this.actionTimer)
      this.actionTimer = window.setTimeout(() => {
        this.show.menu = false
      }, 1000)
    },
    handleKeydown(key) {
      this.unhide()
      const nextOpt = (key, mode, wrap) => {
        this.$emit('update:opts', { ...this.opts, [key]: this.seek(this.opts[key], this.choices[key], mode, wrap) })
      }
      switch (key.key) {
        case 'm': this.show.opts = !this.show.opts; break
        case ' ': this.$emit('update:run', !this.run); break
        case 'r': this.$emit('update:delta', -this.delta); break
        case ']': this.$emit('update:mod', this.seek(this.mod, this.choices.mod, '+')); break
        case '[': this.$emit('update:mod', this.seek(this.mod, this.choices.mod, '-')); break
        case 'l': nextOpt('lineWidth', '+', true); break
        case 'o': nextOpt('lineAlpha', '+', true); break
        case 'd': nextOpt('drawOrder'); break
        case 'c': nextOpt('colorMode'); break
        case 'a': nextOpt('alphaMode'); break
        case 'b': nextOpt('trails', '+', true); break
        case 'z': nextOpt('zoom', '+', true); break
        case '=': nextOpt('ratio', '+'); break
        case '-': nextOpt('ratio', '-'); break
        case 'i': this.$emit('update:opts', { ...this.opts, info: !this.opts.info }); break
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
  opacity: 1;
  background: #000C;

  > * {
    margin: .5rem;
  }

  &.hide {
    opacity: 0;
    transition: 3s ease-in opacity;
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

#test {

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