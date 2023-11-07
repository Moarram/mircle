import { layoutMircle, type LayoutMircleArgs } from './layout'
import { styleMircleLines, type LineStyleConfig } from './style'
import { initCanvas, drawMircleBackground, drawMircleLines, type BackgroundStyleConfig } from './draw'
import type { WorkerRequest, WorkerResponse } from './worker'

export type StyleMircleConfig = {
  lines: LineStyleConfig,
  background: BackgroundStyleConfig,
}

export type CreateMircleArgs = {
  canvas: HTMLCanvasElement,
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  onProgress?: (progressPercent: number) => void,
  signal?: AbortSignal,
}
export async function createMircle({ canvas, layout, styles, onProgress, signal }: CreateMircleArgs) {
  const bitmap = await renderMircleWithWorker({ layout, styles, onProgress, signal })
  if (!bitmap) return // aborted

  console.debug('Drawing bitmap...')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    ctx.drawImage(bitmap, 0, 0)
  }
  bitmap.close()
  console.debug('Done!')
}

export type RenderMircleArgs = {
  canvas: HTMLCanvasElement | OffscreenCanvas, // destination canvas
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  onProgress?: (progressPercent: number) => void,
}
export function renderMircle({ canvas, layout: { modulo, multiple, padding=0, size }, styles: { lines, background }, onProgress }: RenderMircleArgs) {
  console.debug('Computing layout...')
  const mircleLines = layoutMircle({
    modulo,
    multiple,
    padding,
    size
  })

  console.debug('Computing style...')
  const styledLines = styleMircleLines({
    modulo,
    lines: mircleLines,
    styles: lines
  })

  console.debug('Preparing canvas...')
  const ctx = initCanvas({ canvas, size })

  console.debug('Drawing background...')
  drawMircleBackground({
    ctx,
    size,
    padding,
    styles: background,
  })

  console.debug('Drawing lines...')
  drawMircleLines({
    ctx,
    lines: styledLines,
    onProgress: progress => onProgress && onProgress(progress.current / progress.total),
  })
}

export type RenderMircleWithWorkerArgs = {
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  onProgress?: (progressPercent: number) => void,
  signal?: AbortSignal,
}
let worker: Worker | undefined // instance for re-use
export async function renderMircleWithWorker({ onProgress, signal, ...args }: RenderMircleWithWorkerArgs): Promise<ImageBitmap | void> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    }
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data
        if ('progressPercent' in response) {
          onProgress && onProgress(response.progressPercent)
        }
        if ('result' in response) {
          resolve(response.result)
        }
      }
      worker.onerror = (event: ErrorEvent) => {
        reject(event)
      }

    if (signal) signal.onabort = (() => {
      console.debug('Abort!')
      worker?.terminate()
      worker = undefined
      resolve()
    })

    const request: WorkerRequest = {
      action: 'render',
      ...args,
    }
    worker.postMessage(request)
  })
}
