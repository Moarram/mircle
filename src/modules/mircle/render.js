import { draw } from "@moarram/util"

/**
 * Render
 * 
 * Note: this should be async... rather use TypeScript than JSDoc
 * 
 * @param {CanvasRenderingContext2D} ctx - canvas rendering context
 * @param {StyledLine[]} lines - array of styled lines
 * @param {Function} onComplete - callback with ImageBitmap
 * @param {Function} onProgress - callback with statistics
 * 
 * @returns {Function} - callback to cancel
 */
export function renderMircle({ ctx, lines, onComplete=null, onProgress=null, targetFrameMs=100 }) {
  let index = 0
  let stop = false
  let batchSize = 100 // initial value

  const ctxLines = lines.map(line => ({ ctx, ...line }))

  ctx.globalCompositeOperation = 'lighter'
  ctx.imageSmoothingEnabled = false

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
      onProgress(`(${progress}%) ${batchLines.length} lines in ${duration} ms`)

      return (index < lines.length) ? drawBatch() : onProgress('Done!')
    })
  }
  drawBatch()
  return () => stop = true
}