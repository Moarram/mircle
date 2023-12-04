import { layoutMircle } from './layout'
import { initCanvas, drawGradientCircle, drawInvertCircle, drawOutlineCircle, drawGradientLines, drawLines, drawBackground } from './draw'
import type { WorkerRequest, WorkerResponse } from './worker'
import { AbortError, delayFrames, group, statistics } from '@/utils'
import { Colorful, array, draw, math } from '@moarram/util'

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

export type MircleSpecification = {
  size: number, // width and height canvas
  modulo: number, // number of points
  multiple?: number, // optional specific multiple, otherwise all
  padding?: number,
}
export type RenderMircleArgs = {
  canvas: HTMLCanvasElement | OffscreenCanvas, // destination canvas
  specification: MircleSpecification,
  onProgress?: (progressPercent: number) => void,
}
// Render mircle on canvas
export function renderMircle({ canvas, specification: { size, modulo, multiple, padding=0 }, onProgress }: RenderMircleArgs) {
  console.debug('Computing layout...')
  const radius = (size - padding * 2) / 2
  const mircleLines = layoutMircle({ modulo, multiple, radius })

  console.debug('Computing style...')
  const countStats = statistics(mircleLines.map(line => line.count))
  const distanceStats = statistics(mircleLines.map(line => math.distance(line.pos, line.pos2)))

  const radii = mircleLines.map(line => math.round(math.distance({ x: 0, y: 0 }, math.midpoint(line.pos, line.pos2)), 3))
  const radiusStats = statistics(radii)
  const radiusGroups = group(radii)
  const radiusOrder = [...radiusGroups.keys()].sort((a, b) => a - b)

  // console.debug(radiusOrder)

  const density = distanceStats.sum / (Math.PI * radius ** 2) // average number of lines over each pixel
  console.debug(density)
  // TODO utilize density
  // TODO smarter thickness/opacity distribution (see modulo 47, 48, 49)

  const countGroups = group(mircleLines.map(line => line.count)) // map counts -> count
  const countOrder = [...countGroups.keys()].sort((a, b) => a - b)

  // console.debug(countGroups)

  const styledLines = mircleLines.map(line => {
    const lineRadius = math.distance({ x: 0, y: 0 }, math.midpoint(line.pos, line.pos2))
    // const color = new Colorful('#FFF')
    // const color = Colorful.scale(['#F00', '#00F'], 1 - lineRadius / radius)
    // const color = new Colorful((['#F00', '#FF0', '#0F0', '#0FF', '#00F', '#F0F'].at(countOrder.indexOf(line.count) % 6)) || '#FFF')
    const color = Colorful.scale(['#F00', '#FF0', '#0F0', '#0FF', '#00F', '#F0F', '#FFF'], countOrder.indexOf(line.count) / countOrder.length)
    color.setAlpha((.01 + (line.count / countStats.max) * .99))
    if (countStats.max === 1) color.setAlpha(.02)
    return { ...line, color: color.hex }
    // return { ...line, color: '#FFF1' }
  })

  console.debug('Preparing canvas...')
  const ctx = initCanvas({ canvas, size, alpha: true })
  ctx.globalCompositeOperation = 'lighter' // colors add together to become brighter
  // ctx.globalCompositeOperation = 'source-out'
  // ctx.scale(2, 2)

  // console.debug('Drawing background...')
  // drawBackground({ ctx })
  // drawGradientCircle({ ctx, radius, gradient: { 0: '#88F', 1: '#0000' } })
  // drawGradientCircle({ ctx, radius, gradient: { 0: '#000', 0.3: '#08F', .7: '#8FF', 1: '#FFF' } })

  console.debug(`Drawing ${styledLines.length} lines...`)
  // ctx.globalCompositeOperation = 'lighten'
  drawLines({
    ctx,
    lines: styledLines,
    onProgress: progress => onProgress && onProgress(progress.current / progress.total),
  })

  // console.debug('Inverting...')
  // drawInvertCircle({ ctx, radius })

  console.debug('Shading...')
  ctx.globalCompositeOperation = 'source-atop' // circle only under lines (as if the lines reveal the circle)
  drawGradientCircle({ ctx, radius, gradient: { 0: '#FFF8', .5: '#00F4', 1: '#000' } })

  ctx.globalCompositeOperation = 'destination-over' // circle under lines (as if the circle was drawn first)
  drawGradientCircle({ ctx, radius, gradient: { 0: '#F004', 1: '#0080' } })

  ctx.globalCompositeOperation = 'destination-in' // crop to the circle
  draw.circle({ ctx, pos: { x: 0, y: 0 }, r: radius - 1, color: '#000' })

  // drawOutlineCircle({ ctx, radius, extend: radius / 2 }) // crop outside edge

  // ctx.save()
  // ctx.resetTransform()
  // draw.rectangleDebug({ ctx, pos: { x: 0, y: 0 }, pos2: { x: canvas.width, y: canvas.height } })
  // ctx.restore()
}
