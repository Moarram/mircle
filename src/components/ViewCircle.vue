<template>
  <div id="view-circle">
    <TheCircle
			v-model:mult="params.mult"
      :mod="params.mod"
      :delta="params.delta"
      :opts="opts"
			:run="run"
    />
    <TheControls

    />
  </div>
</template>

<script>
import TheCircle from '@/components/TheCircle.vue'
import TheControls from '@/components/TheControls.vue'

export default {
  name: 'ViewCircle',
  components: {
    TheCircle,
    TheControls,
  },
  data() {
    return {
			params: {
				mod: 300,
				mult: 2,
				delta: .05,
			},
			opts: {
				lineWidth: 1,
				lineAlpha: 1,
				drawOrder: 'short',
				colorMode: 'short',
				alphaMode: null,
				trails: 0,
			},
			run: true,
		}
  },
}
</script>

<style lang="scss">
#view-circle {
  width: 100%;
  height: 95vh;
}
</style>
