import { draw } from '@moarram/util'
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
  base: string,
  circle: string,
}

export type DrawMircleBackgroundArgs = {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  size: number,
  padding: number,
  styles: BackgroundStyleConfig,
}
export function drawMircleBackground({ ctx, size, padding, styles }: DrawMircleBackgroundArgs) {
  draw.rectangleCentered({ ctx, pos: { x: 0, y: 0 }, w: ctx.canvas.width, h: ctx.canvas.height, color: styles.base })
  draw.circle({ ctx, pos: { x: 0, y: 0 }, r: size / 2 - padding - 1, color: styles.circle })
}

export type DrawMircleLinesArgs = {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  lines: StyledLine[],
  onProgress?: (progress: Progress) => void,
}
export function drawMircleLines({ ctx, lines, onProgress }: DrawMircleLinesArgs) {
  for (const [i, line] of lines.entries()) { // supposedly for..of performs better than forEach
    draw.line({ ctx, ...line })
    onProgress && i % 100 === 0 && onProgress({ current: i, total: lines.length })
  }
  onProgress && onProgress({ current: lines.length, total: lines.length })
}

export function isOffscreenCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): canvas is OffscreenCanvas {
  return !('transferControlToOffscreen' in canvas)
}
