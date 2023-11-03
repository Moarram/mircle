import { layoutMircle } from './layout'
import { styleMircle } from './style'
import { renderMircle } from './render'
import { primeFactors } from '../utils'

// TODO opacity + thickness based roughly on number of lines
// TODO figure out how to map weighted factors to style (color, thickness, opacity)
// TODO better function arrangement (compute, style, prepare, draw, image)
// TODO output image at last step
// TODO progress reporting
// TODO better names than "link" and "occurences"?
// TODO define types (as comments)
// TODO add style before or after computing positions (for distance? color budget?)
// TODO color based on common multiples, unique color for each number

export type CreateMircleFamilyArgs = {
  canvas: HTMLCanvasElement, // destination canvas
  modulo: number, // number of points around the circle
  size?: number,
  padding?: number,
  onProgress?: (msg: string) => void,
  onComplete?: () => void,
  targetFrameMs?: number,
}
export function createMircleFamily({ canvas, modulo, size=500, padding=10, onProgress, onComplete, targetFrameMs=100 }: CreateMircleFamilyArgs): () => void {
  console.info(`${modulo} = ${primeFactors(modulo).join(' x ')}`)

  onProgress && onProgress('Layout...')
  const mircleLines = layoutMircle({ modulo, size, padding })

  onProgress && onProgress('Style...')
  const styledLines = styleMircle({ modulo, lines: mircleLines })

  onProgress && onProgress('Render...')
  const ctx = initCanvas({ canvas, size })
  // draw.circle({ ctx, pos: { x: 0, y: 0 }, r: size / 2 - padding - 1, color: '#51F' })
  // ctx.globalCompositeOperation = 'multiply'
  ctx.rotate(Math.PI / 4) // 45 deg
  ctx.imageSmoothingEnabled = false
  return renderMircle({ ctx, lines: styledLines, onProgress, targetFrameMs })
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
