<template>
  <button
    @click="isDisabled ? null : $emit('click')"
    :class="{ disabled: isDisabled, on: isOn }"
    :style="styleObj"
  >
    <slot></slot>
  </button>
</template>

<script>

import TinyColor from 'tinycolor2'

export default {
  name: 'BaseButton',
  props: {
    // isDisabled: Boolean,
    isOn: Boolean,
    color: String,
  },
  emits: ['click'],
  computed: {
    styleObj() {
      const color = TinyColor(this.color || '#FFF')
      const wrap = func => func(color.clone()).toString()
      return {
        '--color-button-text': (color.isDark()) ? '#FFFD' : '#000D',
        '--color-button-text-disabled': (color.isDark()) ? '#FFF8' : '#0008',
        '--color-button': wrap(c => c.setAlpha(.8)),
        '--color-button-hover': wrap(c => c.setAlpha(.9)),
        '--color-button-active': wrap(c => c.setAlpha(1)),
        '--color-button-disabled': wrap(c => c.setAlpha(.4)),
      }
    }
  }
}
</script>

<style scoped lang="scss">
  button {
    all: unset;
    padding: .3em 1em;
    position: relative;
    cursor: pointer;
    user-select: none;
    font-weight: bold;
    font-size: 1rem;
    color: var(--color-button-text);
    background: var(--color-button);
    // transition: all .2s; doesn't work with box-shadow?

    &:hover,
    &:focus {
      background-color: var(--color-button-hover);
    }

    &.on,
    &:active {
      &, &:hover, &:focus, &:active {
        background-color: var(--color-button-active);
        border-color: var(--color-button-text);
      }
      &::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1;
        box-shadow: 0 0 0 1px var(--color-button-active);
      }
    }
    &:active::before {
      box-shadow: 0 0 0 2px var(--color-button-active);
    }

    // NOTE the .disabled class isn't fully implemented
    &.disabled {
      &, &:hover, &:focus, &:active {
        cursor: initial;
        color: var(--color-button-text-disabled);
        background-color: var(--color-button-disabled);
      }
    }
  }
</style>