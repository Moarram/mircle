import { draw } from '@moarram/util'
import type { Position, Progress } from '../types'

export type InitCanvasArgs = {
  canvas: HTMLCanvasElement | OffscreenCanvas,
  size: number,
  alpha?: boolean,
}
export function initCanvas({ canvas, size, alpha=false }: InitCanvasArgs): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { alpha })
  if (!ctx) throw new Error('Failed to initialize canvas')
  ctx.translate(size / 2, size / 2) // center of canvas is [0, 0]
  return ctx
}

export type DrawBackgroundArgs = {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  color?: string,
}
export function drawBackground({ ctx, color='#000' }: DrawBackgroundArgs) {
  ctx.save()
  ctx.resetTransform()
  draw.rectangle({
    ctx,
    pos: { x: 0, y: 0 },
    pos2: { x: ctx.canvas.width, y: ctx.canvas.height },
    color,
  })
  ctx.restore()
}

export type GradientSpecification = {
  [k: number]: string, // map percent [0..1] to color
}

export type DrawGradientCircleArgs = {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  pos?: Position,
  radius: number,
  gradient: GradientSpecification,
}
export function drawGradientCircle({ ctx, pos={x:0,y:0}, radius, gradient }: DrawGradientCircleArgs) {
  const radialGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius)
  Object.entries(gradient).forEach(([percent, color]) => {
    radialGradient.addColorStop(parseFloat(percent), color)
  })
  ctx.fillStyle = radialGradient
  draw.circle({ ctx, pos, r: radius })
}

export type GradientLine = {
  pos: Position,
  pos2:  Position,
  thickness?: number,
  gradient: GradientSpecification,
}
export type DrawGradientLineArgs = GradientLine & {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
}
export function drawGradientLine({ ctx, pos, pos2, thickness=1, gradient }: DrawGradientLineArgs) {
  const linearGradient = ctx.createLinearGradient(pos.x, pos.y, pos2.x, pos2.y)
  Object.entries(gradient).forEach(([percent, color]) => {
    linearGradient.addColorStop(parseFloat(percent), color)
  })
  ctx.strokeStyle = linearGradient
  draw.line({ ctx, pos, pos2, thickness })
}

export type DrawGradientLinesArgs = {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  lines: GradientLine[],
  onProgress?: (progress: Progress) => void,
}
export function drawGradientLines({ ctx, lines, onProgress }: DrawGradientLinesArgs) {
  for (const [i, line] of lines.entries()) { // supposedly for..of performs better than forEach
    drawGradientLine({ ctx, ...line })
    onProgress && i % 100 === 0 && onProgress({ current: i, total: lines.length })
  }
  onProgress && onProgress({ current: lines.length, total: lines.length })
}

export type StyledLine = {
  pos: Position,
  pos2: Position,
  color?: string,
  thickness?: number,
}
export type DrawLinesArgs = {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  lines: StyledLine[],
  onProgress?: (progress: Progress) => void,
}
export function drawLines({ ctx, lines, onProgress }: DrawLinesArgs) {
  for (const [i, line] of lines.entries()) { // supposedly for..of performs better than forEach
    draw.line({ ctx, ...line })
    onProgress && i % 100 === 0 && onProgress({ current: i, total: lines.length })
  }
  onProgress && onProgress({ current: lines.length, total: lines.length })
}

export function isOffscreenCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): canvas is OffscreenCanvas {
  return !('transferControlToOffscreen' in canvas)
}
