<script setup lang="ts">
import { Colorful } from '@moarram/util';
import { computed } from 'vue';


const props = defineProps<{
  content: string,
  disabled?: boolean,
  engaged?: boolean,
  color?: string,
  squareLeft?: boolean,
  squareRight?: boolean,
  borderRight?: boolean,
  large?: boolean,
}>()

const emit = defineEmits<{
  click: [],
}>()

const style = computed(() => {
  const color = props.color || '#BBB'
  return {
    '--color-background': color,
    '--color-background-engaged': new Colorful(color).mix('#FFF', .6).hex,
    '--color-background-active': new Colorful(color).mix('#FFF', 1).hex,
    '--color-background-disabled': new Colorful(color).mix('#000', .4).hex,
    '--color-border': new Colorful(color).mix('#000', .3).hex,
    '--color-border-disabled': new Colorful(color).mix('#000', .6).hex,
    ...(props.squareLeft && {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    }),
    ...(props.squareRight && {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    }),
    ...(props.borderRight && {
      borderRight: '1px solid var(--color-border)',
    }),
    ...(props.large && {
      padding: `.5em 1em`,
    })
  }
})

</script>

<template>
  <input
    type="button"
    @click="emit('click')"
    :class="{ engaged }"
    :disabled="props.disabled"
    :value="props.content"
    :style="style"
  />
</template>

<style scoped>
input[type="button"] {
  transform: translate(0, -3px);
  margin-top: 3px;
  padding: .2em .5em;
  font-family: inherit;
  font-size: inherit;
  color: #000C;
  background: var(--color-background);
  border: none;
  border-radius: 5px;
  box-shadow: 0 3px 0 0 var(--color-border);
  user-select: none;

  &:active {
    transform: translate(0, 0);
    background: var(--color-background-active);
    box-shadow: none;
  }

  &.engaged:not(:active) {
    transform: translate(0, -1px);
    background: var(--color-background-engaged);
    box-shadow: 0 1px 0 0 var(--color-border);
  }

  &:disabled {
    transform: translate(0, -2px);
    color: #0008;
    background: var(--color-background-disabled);
    border-color: var(--color-border-disabled);
    box-shadow: 0 2px 0 0 var(--color-border-disabled);
    transition: background .2s, color .2s;
  }

}
</style>