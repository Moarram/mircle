import { draw } from '@moarram/util'
import type { StyledLine } from './style'

export type RenderProgress = {
  description: string, // rendering phase name
  current: number, // completed draw operations
  total: number, // total draw operations
}

export type RenderMircleArgs = {
  ctx: CanvasRenderingContext2D,
  lines: StyledLine[],
  size: number,
  padding: number,
  onProgress?: (progress: RenderProgress) => void,
}
export function renderMircle({ ctx, lines, size, padding, onProgress }: RenderMircleArgs) {
  draw.rectangleCentered({ ctx, pos: { x: 0, y: 0 }, w: ctx.canvas.width, h: ctx.canvas.height, color: '#000' })
  draw.circle({ ctx, pos: { x: 0, y: 0 }, r: size / 2 - padding - 1, color: '#F00' })
  renderLines({ ctx, lines, onProgress })
}

type RenderLinesArgs = {
  ctx: CanvasRenderingContext2D,
  lines: StyledLine[],
  onProgress?: (progress: RenderProgress) => void,
}
function renderLines({ ctx, lines, onProgress }: RenderLinesArgs) {
  for (const [i, line] of lines.entries()) { // supposedly for..of performs better than forEach
    draw.line({ ctx, ...line })
    onProgress && i % 100 === 0 && onProgress({
      description: 'Drawing lines',
      current: i,
      total: lines.length,
    })
  }
  onProgress && onProgress({
    description: 'Drawing lines',
    current: lines.length,
    total: lines.length,
  })
}
