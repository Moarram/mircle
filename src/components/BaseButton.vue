<script setup lang="ts">
import { computed } from 'vue';


const props = defineProps<{
  content: string,
  disabled?: boolean,
  engaged?: boolean,
  squareLeft?: boolean,
  squareRight?: boolean,
  large?: boolean,
}>()

const emit = defineEmits<{
  click: [],
}>()

</script>

<template>
  <input
    type="button"
    @click="emit('click')"
    :class="{ engaged }"
    :disabled="props.disabled"
    :value="props.content"
    :style="{
      ...(squareLeft && {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }),
      ...(squareRight && {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }),
      ...(large && {
        padding: `.5em 1em`,
      })
    }"
  />
</template>

<style scoped>
input[type="button"] {
  transform: translate(0, -3px);
  margin-top: 3px;
  padding: .2em .5em;
  font-family: inherit;
  font-size: inherit;
  color: #000D;
  background: #FFFC;
  border: none;
  border-right: 1px solid #0004;
  border-bottom: 1px solid #FFF1;
  border-radius: 5px;
  box-shadow: 0 3px 0 0 #FFF7;

  &:active {
    transform: translate(0, 0);
    background: #FFF;
    box-shadow: none;
  }

  &.engaged:not(:active) {
    transform: translate(0, -1px);
    background: #FFFE;
    box-shadow: 0 1px 0 0 #FFF8;
  }

  &:disabled {
    transform: translate(0, -2px);
    color: #0008;
    background: #FFF7;
    border-bottom-color: #0000;
    box-shadow: 0 2px 0 0 #FFF4;
  }

}
</style>