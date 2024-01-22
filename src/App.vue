<script setup lang="ts">
import MirclePage from '@/pages/MirclePage.vue'
</script>

<template>
  <main>
    <MirclePage />
  </main>
</template>

<style>
:root {
  --gap: 20px;
  font-size: 14px;
}

body {
  margin: 0;
  padding: 0;
  font-family: "Fira Code", Courier, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #FFFC;
  background: #000;
}

a {
  color: #49F;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:visited {
    color: #49F;
  }
}
</style>
