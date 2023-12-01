import { reactive } from 'vue'
import type { LayoutMircleArgs } from './mircle/layout'
import type { StyleMircleConfig } from './mircle/mircle'

export type Store = {
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  invert: boolean,
  autoRender: boolean,
  isDownloading: boolean,
  isRendering: boolean,
  renderProgress: number,
}
export const store = reactive({
  layout: {
    modulo: 100,
    multiple: undefined,
    size: 1000,
    padding: 0,
  },
  styles: {
    background: {
      // main: '#000',
      // circle: '#D505',
      // circle2: '#104',
    },
    lines: {
      // missing: '#F352',
      // one: '#D312',
      // many: '#F50',
      // short: '#0008',
      // minWidth: 1,
      // maxWidth: 3,
    },
  },
  options: {
    invert: false,
    autoRender: true,
  },
  isDownloading: false,
  isRendering: false,
  renderProgress: 0,
})
