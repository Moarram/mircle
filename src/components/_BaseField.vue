<template>
  <div class="container">
    <input
      type="text"
      @input="onInput"
      @change="onChange"
      @keyup.enter="onKeyEnter"
      @focus="onFocus"
      :value="switchValue"
      :aria-label="ariaLabel"
      :class="{invalid: !!validationMsg}"
      :disabled="isDisabled"
      :placeholder="placeholder"
    >
    <div class="error-wrap">
      <div class="error">{{ validationMsg }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseField',
  props: {
    value: [String, Number],
    placeholder: String,
    ariaLabel: String,
    isDisabled: Boolean,
    validationMsg: String, // empty string means valid
    isWrapped: { // whether this component's value is managed externally
      type: Boolean,
      default: true,
    },
    doSelectAll: Boolean, // whether to select all content when clicked
  },
  data() {
    return {
      localValue: this.value,
    }
  },
  computed: {
    switchValue() {
      return (this.isWrapped) ? this.value : this.localValue
    },
  },
  methods: {
    onInput(event) {
      if (!this.isWrapped) this.localValue = event.target.value
      this.$emit('input', event.target.value)
    },
    onChange(event) {
      if (!this.isWrapped) this.localValue = event.target.value
      this.$emit('change', event.target.value)
    },
    onKeyEnter(event) {
      if (!this.isWrapped) this.localValue = event.target.value
      this.$emit('key-enter', event.target.value)
    },
    onFocus(event) {
      if (this.doSelectAll) event.target.select()
    },
  },
}
</script>

<style scoped>
  .container {
    width: 12em;
  }
  .error-wrap {
    width: 0;
    height: 0;
    position: relative;
  }
  .error {
    width: 12em;
    position: absolute;
    z-index: 99;
    text-align: left;
    color: var(--color-invalid-input);
  }
  input {
    width: 100%;
    padding: .2em .3em;
    text-align: inherit;
    box-sizing: border-box;
    border: 1px solid var(--color-input);
    border-radius: 4px;
    outline: none;
  }
  input::placeholder {
    color: var(--color-input);
  }
  input:hover {
    border-color: var(--color-input-hover);
  }
  input:focus,
  input:active {
    border-width: var(--length-input-active);
    border-color: var(--color-input-active);
  }

  input.invalid,
  input.invalid:hover {
    border-color: var(--color-invalid-input);
  }
  input.invalid:focus,
  input.invalid:active {
    box-shadow: 0 0 0 1px var(--color-invalid-input);
  }

  input:disabled,
  input:disabled:hover,
  input:disabled:focus,
  input:disabled:active {
    pointer-events: none;
    color: var(--color-text-disabled);
    background-color: var(--color-input-back-disabled);
    border-color: var(--color-input-disabled);
    box-shadow: none;
  }
</style>