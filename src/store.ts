import { reactive } from 'vue'
import type { LayoutMircleArgs } from './mircle/layout'
import type { StyleMircleConfig } from './mircle/mircle'

export type Store = {
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  autoRender: boolean,
  isDownloading: boolean,
  isRendering: boolean,
}
export const store = reactive({
  layout: {
    modulo: 100,
    multiple: undefined,
    size: 1000,
    padding: 0,
  },
  styles: {
    lines: {},
    background: {},
  },
  autoRender: true,
  isDownloading: false,
  isRendering: false,
})
