import { reactive } from 'vue'
import type { LayoutMircleArgs } from './mircle/layout'
import type { StyleMircleConfig } from './mircle/mircle'

export type Store = {
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  isRendering: boolean,
  isDownloading: boolean,
}
export const store = reactive({
  layout: {
    modulo: 450,
    multiple: undefined,
    size: 7000,
    padding: 10,
  },
  styles: {
    lines: {},
    background: {},
  },
  isRendering: false,
  isDownloading: false,
})
