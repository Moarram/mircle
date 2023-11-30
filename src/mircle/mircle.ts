import { layoutMircle, type LayoutMircleArgs } from './layout'
import { styleMircleLines, type LineStyleConfig } from './style'
import { initCanvas, drawMircleBackground, drawMircleLines, type BackgroundStyleConfig, invertMircle } from './draw'
import type { WorkerRequest, WorkerResponse } from './worker'
import { delayFrames } from '@/utils'
import { Colorful } from '@moarram/util'

export type StyleMircleConfig = {
  lines: LineStyleConfig,
  background: BackgroundStyleConfig,
}

export type CreateMircleArgs = {
  canvas: HTMLCanvasElement,
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  invert?: boolean,
  onProgress?: (progressPercent: number) => void,
  signal?: AbortSignal,
}
export async function createMircle({ canvas, layout, styles, invert, onProgress, signal }: CreateMircleArgs) {
  const bitmap = await renderMircleWithWorker({ layout, styles, invert, onProgress, signal })
  if (!bitmap) return // aborted

  await delayFrames(2) // give ui a chance to update

  console.debug('Drawing bitmap...')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('bitmaprenderer')
  ctx?.transferFromImageBitmap(bitmap)
  bitmap.close() // cleanup

  console.debug('Done!')
}

export type RenderMircleWithWorkerArgs = {
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  invert?: boolean,
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

export type RenderMircleArgs = {
  canvas: HTMLCanvasElement | OffscreenCanvas, // destination canvas
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
  invert?: boolean,
  onProgress?: (progressPercent: number) => void,
}
export function renderMircle({ canvas, layout: { modulo, multiple, padding=0, size }, styles: { lines, background }, invert=false, onProgress }: RenderMircleArgs) {
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
    styles: invert ? {
      ...lines,
      missing: new Colorful(lines.missing).invert().hex,
      one: new Colorful(lines.one).invert().hex,
      many: new Colorful(lines.many).invert().hex,
      short: new Colorful(lines.short).invert().hex,
    } : lines
  })

  console.debug('Preparing canvas...')
  const ctx = initCanvas({ canvas, size })
  ctx.globalCompositeOperation = 'lighter'

  console.debug('Drawing background...')
  drawMircleBackground({
    ctx,
    size,
    padding,
    styles: invert ? {
      ...background,
      circle: new Colorful(background.circle).invert().hex,
      ...(background.circle2 ? { circle2: new Colorful(background.circle2).invert().hex } : {}),
    } : background,
  })

  console.debug('Drawing lines...')
  drawMircleLines({
    ctx,
    lines: styledLines,
    onProgress: progress => onProgress && onProgress(progress.current / progress.total),
  })

  if (invert) {
    console.debug('Inverting...')
    invertMircle({
      ctx,
      size,
      padding,
    })
  }
}
