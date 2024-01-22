import { AbortError, delayFrames } from '../utils'
import type { MircleSpecification } from './drawMircle'
import type { WorkerRequest, WorkerResponse } from './worker'

export type CreateMircleArgs = {
  canvas: HTMLCanvasElement,
  specification: MircleSpecification,
  onProgress?: (progressPercent: number) => void,
  signal?: AbortSignal,
}
// Render mircle image with a worker and transfer to canvas
export async function createMircle({ canvas, specification, signal, onProgress }: CreateMircleArgs) {
  let bitmap: ImageBitmap | undefined

  try {
    bitmap = await renderMircleWithWorker({ specification, signal, onProgress })

    await delayFrames(2) // give ui a chance to update

    console.debug('Drawing bitmap...')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('bitmaprenderer')
    ctx?.transferFromImageBitmap(bitmap)

    console.debug('Done!')

  } finally {
    bitmap?.close() // cleanup
  }
}

export type RenderMircleWithWorkerArgs = {
  specification: MircleSpecification,
  signal?: AbortSignal,
  onProgress?: (progressPercent: number) => void,
}
let worker: Worker | undefined // instance for re-use
// Render mircle image with a worker
export async function renderMircleWithWorker({ specification, signal, onProgress }: RenderMircleWithWorkerArgs): Promise<ImageBitmap> {
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
      console.debug('Error!')
      worker?.terminate()
      worker = undefined
      reject(event)
    }

    if (signal) signal.onabort = (() => {
      console.debug('Abort!')
      worker?.terminate()
      worker = undefined
      reject(new AbortError())
    })

    const request: WorkerRequest = {
      action: 'render',
      specification,
    }
    worker.postMessage(request)
  })
}