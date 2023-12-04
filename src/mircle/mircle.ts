import { layoutMircle } from './layout'
import { initCanvas, drawGradientCircle, drawInvertCircle, drawOutlineCircle, drawGradientLines, drawBackground } from './draw'
import type { WorkerRequest, WorkerResponse } from './worker'
import { delayFrames, group, statistics } from '@/utils'
import { Colorful, array, draw, math } from '@moarram/util'

export type CreateMircleArgs = {
  canvas: HTMLCanvasElement,
  specification: MircleSpecification,
  onProgress?: (progressPercent: number) => void,
  signal?: AbortSignal,
}
export async function createMircle({ canvas, specification, signal, onProgress }: CreateMircleArgs) {
  const bitmap = await renderMircleWithWorker({ specification, signal, onProgress })
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
  specification: MircleSpecification,
  signal?: AbortSignal,
  onProgress?: (progressPercent: number) => void,
}
let worker: Worker | undefined // instance for re-use
export async function renderMircleWithWorker({ specification, signal, onProgress }: RenderMircleWithWorkerArgs): Promise<ImageBitmap | void> {
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
      worker?.terminate()
      worker = undefined
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

  console.debug(radiusOrder)

  const density = distanceStats.sum / (Math.PI * radius ** 2) // average number of lines over each pixel
  console.debug(density)

  const countGroups = group(mircleLines.map(line => line.count)) // map counts -> count
  const countOrder = Object.keys(countGroups).map(n => parseInt(n)).sort((a, b) => a - b)

  console.debug(countGroups)

  const gradientLines = mircleLines.map(line => {
    const midpoint = math.midpoint(line.pos, line.pos2)

    // const countPercent = line.count / countStats.max
    const countIndex = countOrder.indexOf(line.count)
    const countPercent = countIndex / (countOrder.length - 1)
    // const rarityPercent = 

    const distancePercent = math.distance(line.pos, line.pos2) / distanceStats.max

    const lineRadius = math.round(math.distance({ x: 0, y: 0 }, math.midpoint(line.pos, line.pos2)), 3)
    const radiusIndex = radiusOrder.indexOf(lineRadius)
    const radiusPercent = math.distance({ x: 0, y: 0 }, midpoint) / radius

    // TODO Colorful.scale doesn't work well... find alternative
    // TODO weighted properties

    // TODO generate gradient lines here
    //...

    const isPrime = countStats.max === 2

    // const alpha = .8 * (isPrime ? .3 : .3 + countPercent * .7) + .2 * (1 - radiusPercent)
    // const color = Colorful.scale(['#F00', '#FF0'], isPrime ? .2 : countPercent)
    // const centerColor = color.mix('#F00', topPercent).mix('#0FF', bottomPercent).setAlpha(alpha).hex
    // const edgeColor = color.mix('#00F', radiusPercent).setAlpha(isPrime ? 0 : countPercent * (1 - radiusPercent)).hex

    // const baseColor = Colorful.scale(['#F01', '#FF5'], countPercent)
    // const color1 = new Colorful(['#F00', '#0FF', '#0F0', '#F0F', '#FF0', '#00F'].at((countIndex + 3) % 6) || '#FFF')
    // const color2 = new Colorful(['#F00', '#0FF', '#0F0', '#F0F', '#FF0', '#00F'].at((line.multiples?.length || 0) % 6) || '#FFF')
    const color1 = Colorful.scale(['#FED', '#F82', '#800', '#0000'], radiusPercent)
    // const color = countOrder.indexOf(line.count) % 2 ? baseColor.mix('#00F', .6) : baseColor // alternating
    // color.setAlpha((.01 + (line.count / countStats.max) * .99) * radiusPercent / 2)
    // const color1 = new Colorful('#FFF')
    color1.setAlpha((1/255 + (line.count / countStats.max) * (1 - radiusPercent ** 2) * 254/255))

    const edge = new Colorful('#000').setAlpha(0)//.setAlpha(line.count / countStats.max)

    return {
      ...line,
      // gradient: { 0: edgeColor, .5: centerColor, 1: edgeColor },
      gradient: { 0: edge.hex, .3: color1.hex, .7: color1.hex, 1: edge.hex },
      // gradient: { 0: '#0000', .5: color.setAlpha(.1 + countPercent * .9).hex, 1: '#0000' },
      thickness: isPrime ? 1 : 1 + countPercent * (radius / 2000),
    }
  })

  console.debug('Preparing canvas...')
  const ctx = initCanvas({ canvas, size })
  ctx.globalCompositeOperation = 'lighter' // colors add together to become brighter

  console.debug('Drawing background...')
  drawBackground({ ctx })
  drawGradientCircle({ ctx, radius, gradient: { 0: '#F83', 0.5: '#8008', 1: '#3080' } })
  // drawGradientCircle({ ctx, radius, gradient: { 0: '#000', 0.3: '#08F', .7: '#8FF', 1: '#FFF' } })

  // ctx.save()
  // ctx.translate(-size / 2, -size / 2)
  // draw.rectangleDebug({ ctx, pos: { x: 0, y: 0 }, pos2: { x: canvas.width, y: canvas.height } })
  // ctx.restore()

  console.debug('Drawing lines...')
  drawGradientLines({
    ctx,
    lines: gradientLines,
    onProgress: progress => onProgress && onProgress(progress.current / progress.total),
  })

  // console.debug('Inverting...')
  // drawInvertCircle({ ctx, radius })
  drawOutlineCircle({ ctx, radius, extend: radius / 2 })
}
