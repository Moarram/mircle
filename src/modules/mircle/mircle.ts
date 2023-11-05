import { layoutMircle } from './layout'
import { styleMircle } from './style'
import { initCanvas, renderMircle } from './render'
import type { Progress } from '../types'
import type { WorkerRequest, WorkerResponse } from './worker'

// TODO opacity + thickness based roughly on number of lines
// TODO figure out how to map weighted factors to style (color, thickness, opacity)
// TODO output image at last step
// TODO add style before or after computing positions (for distance? color budget?)
// TODO color based on common multiples, unique color for each number



export type CreateMircleArgs = {
  canvas: HTMLCanvasElement | OffscreenCanvas, // destination canvas
  modulo: number, // number of points around the circle
  multiple?: number, // multiplier for modulo to find second points
  size?: number,
  padding?: number,
  onProgress?: (progress: Progress) => void,
}
export function createMircle({ canvas, modulo, multiple, size=500, padding=10, onProgress }: CreateMircleArgs) {
  const report = (message: string) => onProgress && onProgress({ message, current: 0, total: 0 })

  report('Layout...')
  const mircleLines = layoutMircle({ modulo, multiple, size, padding })

  report('Style...')
  const styledLines = styleMircle({ modulo, lines: mircleLines })

  report('Prepare...')
  const ctx = initCanvas({ canvas, size })

  report('Render...')
  renderMircle({ ctx, lines: styledLines, size, padding, onProgress })

  report('Done')
}

export type CreateMircleWithWorkerArgs = CreateMircleArgs & {
  canvas: OffscreenCanvas,
  signal?: AbortSignal,
}
let worker: Worker
export async function createMircleWithWorker({ canvas, onProgress, signal, ...args }: CreateMircleWithWorkerArgs) {
  return new Promise<void>((resolve, reject) => {
    if (!worker) worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data
      if ('progress' in response) {
        onProgress && onProgress(response.progress)
      }
      if ('finished' in response) {
        resolve()
      }
    }
    worker.onerror = (event: ErrorEvent) => {
      reject(event)
    }

    if (signal) signal.onabort = (() => {
      worker.terminate()
      resolve()
    })

    const request: WorkerRequest = {
      action: 'render',
      canvas,
      ...args,
    }
    worker.postMessage(request, [canvas])
  })
}
