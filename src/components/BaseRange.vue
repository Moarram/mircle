<template>
  <div class="container">
    <input
      type="range"
      @input="onRangeInput"
      @change="onRangeChange"
      :step="step || 'any'"
      :style="styleObj"
    >
    <input
      type="text"
      @input="onTextInput"
      @change="onTextChange"
      @focus="event => event.target.select()"
      :value="value"
      :style="styleObj"
    >
  </div>
</template>

<script>

import TinyColor from 'tinycolor2'

export default {
  name: 'BaseRange',
  props: {
    // isDisabled: Boolean,
    value: Number,
    min: Number,
    max: Number,
    step: Number, // 0 for "any"
    doLog: Boolean,
    color: String,
  },
  emits: ['change'],
  computed: {
    styleObj() {
      const color = TinyColor(this.color || '#FFF')
      const wrap = func => func(color.clone()).toString()
      return {
        '--color-range-text': (color.isDark()) ? '#FFFD' : '#000D',
        '--color-range-text-disabled': (color.isDark()) ? '#FFF8' : '#0008',
        '--color-range': wrap(c => c.setAlpha(.8)),
        '--color-range-hover': wrap(c => c.setAlpha(.9)),
        '--color-range-active': wrap(c => c.setAlpha(1)),
        '--color-range-disabled': wrap(c => c.setAlpha(.4)),
      }
    }
  },
  methods: {
    onTextInput(event) {
      this.$emit('input', event.target.value)
    },
    onTextChange(event) {
      this.$emit('change', event.target.value)
    },
  },
}
</script>

<style scoped lang="scss">
  
</style>