import { draw, math } from '@moarram/util'
import type { StyledLine } from './style'
import type { Progress } from '../types'

export type InitCanvasArgs = {
  canvas: HTMLCanvasElement | OffscreenCanvas,
  size: number,
}
export function initCanvas({ canvas, size }: InitCanvasArgs): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Failed to initialize canvas')
  ctx.translate(size / 2, size / 2)
  return ctx
}

export type BackgroundStyleConfig = {
  main: string, // color of canvas background
  circle: string, // color of mircle background, or center of circle gradient
  circle2?: string, // color of outside of circle gradient
}

export type DrawMircleBackgroundArgs = {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  size: number,
  padding: number,
  // styles: BackgroundStyleConfig,
}
export function drawMircleBackground({ ctx, size, padding }: DrawMircleBackgroundArgs) {
  draw.rectangleCentered({ ctx, pos: { x: 0, y: 0 }, w: ctx.canvas.width, h: ctx.canvas.height, color: '#000' })
  // const colors = ['#C31', '#003']
  // const colors = ['#FDA', '#F50C', '#A018', '#0035']
  const colors = ['#DD8', '#048', '#000'].reverse()
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2 - padding - 1)
  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color)
  })
  ctx.fillStyle = gradient
  draw.circle({ ctx, pos: { x: 0, y: 0 }, r: size / 2 - padding - 1 })
}

export type DrawMircleLinesArgs = {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  lines: StyledLine[],
  onProgress?: (progress: Progress) => void,
}
export function drawMircleLines({ ctx, lines, onProgress }: DrawMircleLinesArgs) {
  for (const [i, line] of lines.entries()) { // supposedly for..of performs better than forEach
    if (Array.isArray(line.color)) {
      const gradient = ctx.createLinearGradient(line.pos.x, line.pos.y, line.pos2.x, line.pos2.y)
      line.color.forEach((color, i) => {
        gradient.addColorStop(i / (line.color.length - 1), color)
      })
      ctx.strokeStyle = gradient
    } else {
      ctx.strokeStyle = line.color
    }
    // TODO bug in Safari... gradient incompatible with line width other than 1
    // for (let i = 0; i < 5; i++) draw.line({ ctx, ...line, color: undefined })
    // draw.line({ ctx, pos: line.pos, pos2: line.pos2, thickness: 1 })
    draw.line({ ctx, ...line, color: undefined })
    onProgress && i % 100 === 0 && onProgress({ current: i, total: lines.length })
  }
  onProgress && onProgress({ current: lines.length, total: lines.length })
}

export type InvertMircleArgs = {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  size: number,
  padding: number,
}
export function invertMircle({ ctx, size, padding }: InvertMircleArgs) {
  ctx.globalCompositeOperation = 'difference'
  draw.circle({
    ctx,
    pos: { x: 0, y: 0 },
    r: size / 2 - padding - 1,
    color: '#FFF'
  })
  ctx.globalCompositeOperation = 'source-over'
  draw.circle({
    ctx,
    pos: { x: 0, y: 0 },
    r: size / 2 - padding + 30,
    thickness: 64, // extra thicc
    fill: false,
    color: '#000' // we assume a black background
  })
}

export function isOffscreenCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): canvas is OffscreenCanvas {
  return !('transferControlToOffscreen' in canvas)
}
