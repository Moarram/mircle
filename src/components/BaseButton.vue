<template>
  <button
    @click="isDisabled ? null : $emit('click')"
    :class="{ disabled: isDisabled }"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    isDisabled: Boolean,
  },
  emits: ['click'],
  computed: {

  }
}
</script>

<style scoped lang="scss">
  button {
    all: unset;
    padding: .3em 1em;
    cursor: pointer;
    user-select: none;
    font-weight: bold;
    font-size: 1rem;
    color: #000;
    background: #DDD;
  }
  button:hover,
  button:focus {
    // background-color: var(--color-button-hover);
  }
  button:active {
    // background-color: var(--color-button-active);
  }
  button.disabled,
  button.disabled:hover,
  button.disabled:focus,
  button.disabled:active {
    cursor: initial;
    // color: var(--color-text-disabled);
    // background-color: var(--color-input-back-disabled);
  }
</style>