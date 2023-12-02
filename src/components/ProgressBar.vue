<script setup lang="ts">

const props = defineProps<{
  percent: number, // in range [0..1]
}>()

</script>

<template>
  <div class="box">
    <div class="bar" :style="{width: `${props.percent * 100}%`}"></div>
  </div>
</template>

<style scoped>
.box {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  background: #111;
  border-radius: 3px;
}
.bar {
  height: 1rem;
  background: #DDD;
  border-radius: 3px;
}
</style>