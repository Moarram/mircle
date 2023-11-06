import { layoutMircle, type LayoutMircleArgs } from './layout'
import { styleMircleLines, type LineStyleConfig } from './style'
import { initCanvas, drawMircleBackground, drawMircleLines, type BackgroundStyleConfig } from './draw'
import type { Progress } from '../types'
import type { WorkerRequest, WorkerResponse } from './worker'

// TODO opacity + thickness based roughly on number of lines
// TODO figure out how to map weighted factors to style (color, thickness, opacity)
// TODO add style before or after computing positions (for distance? color budget?)
// TODO color based on common multiples, unique color for each number

export type StyleMircleConfig = {
  lines: LineStyleConfig,
  background: BackgroundStyleConfig,
}

export type CreateMircleArgs = {
  canvas: HTMLCanvasElement,
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  onProgress?: (progress: Progress) => void,
  signal?: AbortSignal,
}
export async function createMircle({ canvas, layout, styles, onProgress, signal }: CreateMircleArgs) {
  const bitmap = await renderMircleWithWorker({ layout, styles, onProgress, signal })
  if (!bitmap) return // aborted

  const ctx = canvas.getContext('2d')
  if (ctx) {
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    ctx.drawImage(bitmap, 0, 0)
  }
  bitmap.close() // make sure this happens
}

export type RenderMircleArgs = {
  canvas: HTMLCanvasElement | OffscreenCanvas, // destination canvas
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  onProgress?: (progress: Progress) => void,
}
export function renderMircle({ canvas, layout: { modulo, multiple, padding=0, size }, styles: { lines, background }, onProgress }: RenderMircleArgs) {
  const report = (message: string) => onProgress && onProgress({ message, current: 0, total: 0 })

  report('Layout...')
  const mircleLines = layoutMircle({ modulo, multiple, padding, size })

  report('Style...')
  const styledLines = styleMircleLines({ modulo, lines: mircleLines, styles: lines })

  report('Prepare...')
  const ctx = initCanvas({ canvas, size })

  report('Draw...')
  drawMircleBackground({ ctx, size, padding, styles: background, onProgress })
  drawMircleLines({ ctx, lines: styledLines, onProgress })

  report('Done')
}

export type RenderMircleWithWorkerArgs = {
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  onProgress?: (progress: Progress) => void,
  signal?: AbortSignal,
}
let worker: Worker | undefined // instance for re-use
export async function renderMircleWithWorker({ onProgress, signal, ...args }: RenderMircleWithWorkerArgs): Promise<ImageBitmap | void> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data
        if ('progress' in response) {
          onProgress && onProgress(response.progress)
        }
        if ('result' in response) {
          resolve(response.result)
        }
      }
      worker.onerror = (event: ErrorEvent) => {
        reject(event)
      }
    }

    if (signal) signal.onabort = (() => {
      worker?.terminate()
      resolve()
    })

    const request: WorkerRequest = {
      action: 'render',
      ...args,
    }
    worker.postMessage(request)
  })
}
