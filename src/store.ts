import type { MircleSpecification } from './mircle/mircle'
import { defineStore } from 'pinia'

export type StoreState = {
  modulo: number,
  multiple: number | 'all',
  size: number | 'auto',
  padding: number | 'auto',
  autoRender: boolean,
  style: 'fancy' | 'plain',
  crop: boolean,
  labels: boolean,
  activity: 'render' | 'download' | null,
  renderProgress: number,
}

// TODO ui toggle for crop
// TODO vertex labels
// TODO consider modes if planning to animate:
//  grouped mircle (all mults within mod, made to look cool)
//  mircle (single mult, made to look cool and explain)
//  animated mircle (changing mult, made for speed)
//  about (some kind of explainer with labels, colors, animations, etc... could just be images in readme?)

export const useStore = defineStore('store', {
  state: (): StoreState => ({
    modulo: 100,
    multiple: 'all',
    size: 'auto',
    padding: 'auto',
    autoRender: true,
    style: 'fancy',
    crop: false,
    labels: false,
    activity: null,
    renderProgress: 0,
  }),
  getters: {
    specification: (state: StoreState): MircleSpecification => {
      const modulo = state.multiple === 'all' ? Math.min(state.modulo, 999) : state.modulo
      const multiple = state.multiple === 'all' ?  undefined : Math.min(modulo, state.multiple)
      const autoSize = (Math.min(window.innerWidth, window.innerHeight) - 20) * window.devicePixelRatio || 1
      const size = state.size === 'auto' ? autoSize : state.size
      const padding = state.padding === 'auto' ? size / 100 : state.padding
      return { modulo, multiple, size, padding, style: state.style, crop: state.crop, labels: state.labels }
    },
  },
  actions: {},
})