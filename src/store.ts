import { reactive } from 'vue'
import type { MircleSpecification } from './mircle/mircle'

export type Store = {
  layout: MircleSpecification,
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
  },
  options: {
    autoRender: true,
  },
  isDownloading: false,
  isRendering: false,
  renderProgress: 0,
})
