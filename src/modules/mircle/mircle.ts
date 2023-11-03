import { layoutMircle, layoutMircleFamily } from './layout'
import { styleMircle } from './style'
import { renderMircle, type RenderProgress } from './render'

// TODO opacity + thickness based roughly on number of lines
// TODO figure out how to map weighted factors to style (color, thickness, opacity)
// TODO output image at last step
// TODO add style before or after computing positions (for distance? color budget?)
// TODO color based on common multiples, unique color for each number

export type CreateMircleArgs = {
  canvas: HTMLCanvasElement, // destination canvas
  modulo: number, // number of points around the circle
  multiple: number, // multiplier for modulo to find second points
  size?: number,
  padding?: number,
  onProgress?: (message: string) => void,
}
export function createMircle({ canvas, modulo, multiple, size=500, padding=10, onProgress }: CreateMircleArgs) {
  const report = (message: string) => onProgress && onProgress(message)

  report('Layout...')
  const mircleLines = layoutMircle({ modulo, multiple, size, padding })

  report('Style...')
  const styledLines = styleMircle({ modulo, lines: mircleLines })

  report('Prepare...')
  const ctx = initCanvas({ canvas, size })
  ctx.imageSmoothingEnabled = false

  report('Render...')
  const onRenderProgress = ({ description, current, total }: RenderProgress) => {
    report(`${description} (${current}/${total})`)
  }
  renderMircle({ ctx, lines: styledLines, size, padding, onProgress: onRenderProgress })
  report('Done')
}

export type CreateMircleFamilyArgs = {
  canvas: HTMLCanvasElement, // destination canvas
  modulo: number, // number of points around the circle
  size?: number,
  padding?: number,
  onProgress?: (message: string) => void,
}
export function createMircleFamily({ canvas, modulo, size=500, padding=10, onProgress }: CreateMircleFamilyArgs) {
  const report = (message: string) => onProgress && onProgress(message)

  report('Layout...')
  const mircleLines = layoutMircleFamily({ modulo, size, padding })

  report('Style...')
  const styledLines = styleMircle({ modulo, lines: mircleLines })

  report('Prepare...')
  const ctx = initCanvas({ canvas, size })
  ctx.imageSmoothingEnabled = false

  report('Render...')
  const onRenderProgress = ({ description, current, total }: RenderProgress) => {
    report(`${description} (${current}/${total})`)
  }
  renderMircle({ ctx, lines: styledLines, size, padding, onProgress: onRenderProgress })
  report('Done')
}

type InitCanvasArgs = {
  canvas: HTMLCanvasElement,
  size: number,
}
function initCanvas({ canvas, size }: InitCanvasArgs): CanvasRenderingContext2D {
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Failed to initialize canvas')
  ctx.translate(size / 2, size / 2)
  return ctx
}
