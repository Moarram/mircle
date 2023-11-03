import { draw } from '@moarram/util'
import type { StyledLine } from './style'

// TODO async

export type RenderMircleArgs = {
  ctx: CanvasRenderingContext2D,
  lines: StyledLine[],
  onProgress?: (msg: string) => void,
  onComplete?: () => void,
  targetFrameMs?: number,
}
export function renderMircle({ ctx, lines, onProgress, onComplete, targetFrameMs=100 }: RenderMircleArgs): () => void {
  let index = 0
  let stop = false
  let batchSize = 100 // initial value

  const ctxLines = lines.map(line => ({ ctx, ...line }))

  function drawBatch() {
    const batchLines = ctxLines.slice(index, index + batchSize)
    index += batchLines.length

    window.requestAnimationFrame(() => {
      if (stop) return

      const startTimestamp = Date.now()
      batchLines.forEach(line => draw.line(line))
      const duration = Date.now() - startTimestamp

      const correction = Math.max(Math.min(targetFrameMs / duration, 2), 0.5)
      batchSize = Math.max(Math.floor(batchSize * correction), 1)

      const progress = Math.floor((index / lines.length) * 100)
      onProgress && onProgress(`(${progress}%) ${batchLines.length} lines in ${duration} ms`)

      return (index < lines.length) ? drawBatch() : onProgress && onProgress('Done!')
    })
  }
  drawBatch()
  return () => stop = true
}