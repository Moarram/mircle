<template>
	<div id="controls">
		<div id="draw-controls">
			<div>[L] line width: <span class="right val">{{ opts.lineWidth }}</span></div>
			<div>... opacity: <span class="right val">{{ opts.lineAlpha }}</span></div>
			<div>[D] draw order: <span class="right val">{{ opts.drawOrder }}</span></div>
			<div>[C] color mode: <span class="right val">{{ opts.colorMode || 'plain' }}</span></div>
			<div>[A] opacity mode: <span class="right val">{{ opts.alphaMode || 'full' }}</span></div>
			<div>... blurring: <span class="right val">{{ opts.trails }}</span></div>
			<div>[=/-] resolution: <span class="right val">{{ opts.ratio }}x</span></div>
			<div>[Z] zoom: <span class="right val">{{ opts.zoom }}x</span></div>
		</div>
		<div id="animation-controls">
			<div>[Space] animating: <span class="val">{{ run }}</span></div>
			<div>[↑/↓] delta: <span class="val">{{ delta }}</span></div>
			<div>[R] reverse</div>
		</div>
		<div id="fps"><span class="val">{{ fps }}</span>&nbsp;FPS</div>
		<div id="data-controls">
			<div>[[/]] # of lines: <span class="right val">{{ mod }}</span></div>
			<div>[←/→] multiple: <span class="right val">{{ multRounded }}</span></div>
		</div>
	</div>
</template>

<script>
import * as U from '@/modules/utils.js'

export default {
	name: 'TheControls',
	props: {
		mod: Number,
		mult: Number,
		delta: Number,
		opts: Object,
		run: Boolean,
		fps: Number,
	},
	data() {
		return {

		}
	},
	computed: {
		multRounded() {
			return U.math.round(this.mult, 4)
		}
	},
}
</script>

<style lang="scss">
$edge: 5px;
$bump: 10px;

#controls {
	width: calc(100% - $edge * 2);
	padding: $edge;
	display: flex;
	flex-flow: row nowrap;
	align-items: flex-start;
	justify-content: space-around;

	> * {
		padding: 7px 10px 10px 10px;
		border-radius: 3px;
		background: #111A;
	}
}
#animation-controls {
	margin-right: 0 $edge;
	padding-left: $bump;
	flex-grow: 1;
	display: flex;
	flex-flow: row wrap;
	justify-content: space-between;

	> div:not(:last-child) {
		margin-right: 10px;
	}
}
#data-controls,
#draw-controls {
	min-width: 20vw;
	display: flex;
	flex-flow: column;
}
#draw-controls {
	margin-right: $edge;
}
#fps {
	margin: 0 $edge;
}
.right {
	float: right;
}
.val {
	color: #DB5;
}
.row {
	display: flex;
	flex-flow: row wrap;
}
</style>