import { reactive } from 'vue'
import type { LayoutMircleArgs } from './mircle/layout'
import type { StyleMircleConfig } from './mircle/mircle'

export type Store = {
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
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
    lines: {
      missing: '#0000',
      one: '#F311',
      many: '#FA4',
    },
    background: {
      main: '#000',
      circle: '#00F1'
    },
  },
  autoRender: true,
  isDownloading: false,
  isRendering: false,
  renderProgress: 0,
})
