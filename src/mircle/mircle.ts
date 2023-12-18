import { layoutGroupedMircle, layoutMircle } from './layout'
import { initCanvas, drawGradientCircle, drawGradientLines, drawLines, drawBackground } from './draw'
import type { WorkerRequest, WorkerResponse } from './worker'
import { AbortError, delayFrames, group, primeFactors, statistics } from '@/utils'
import { Colorful, draw, math } from '@moarram/util'
import type { Progress } from '@/types'

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
  console.debug('Preparing canvas...')
  const ctx = initCanvas({ canvas, size, alpha: true })

  console.debug('Computing layout...')
  const radius = (size - padding * 2) / 2
  const mircleLines = layoutGroupedMircle({ modulo, radius })
    .sort((a, b) => a.multiples.length - b.multiples.length)
    // .sort((a, b) => math.distance(a.pos, a.pos2) - math.distance(b.pos, b.pos2))

  const lineRadiusStats = statistics(mircleLines.map(line => math.distance({ x: 0, y: 0 }, math.midpoint(line.pos, line.pos2))))
  const lineDistanceStats = statistics(mircleLines.map(line => math.distance(line.pos, line.pos2)))

  const mircleLinesByStack = group(mircleLines, line => line.multiples.length) // maps stack to lines
  const stacks = [...mircleLinesByStack.keys()].sort((a, b) => a - b) // ascending order
  const stackStats = statistics(stacks)
  const stackDistances = new Map(Array.from(mircleLinesByStack).map(([stack, lines]) => [stack, lines.reduce((acc, line) => acc + math.distance(line.pos, line.pos2), 0)])) // map: stack -> distance

  console.debug(stacks)

  const density = lineDistanceStats.sum / (Math.PI * radius ** 2) // average number of lines over each pixel
  const densityTarget = 10 // desired density
  const densityMultiplier = math.clamp(densityTarget / density, 0.01, 10) // multiplier to reach target
  console.debug(densityMultiplier)

  console.debug('Computing styles...')
  const styledLines = mircleLines.map(line => {
    // const angle = math.angle(line.pos, line.pos2)
    // const verticalPercent = Math.sin(angle) ** 6
    // const horizontalPercent = Math.cos(angle) ** 6
    // const diagonalPercent = 1 - Math.max(verticalPercent, horizontalPercent) * 0.7

    const lineRadius = math.distance({ x: 0, y: 0 }, math.midpoint(line.pos, line.pos2))
    const lineRadiusPercent = lineRadius / lineRadiusStats.max

    const lineDistance = math.distance(line.pos, line.pos2)
    const lineDistancePercent = lineDistance / lineDistanceStats.max // 0=short 1=long

    const stack = line.multiples.length
    const stackMaxPercent = stack / stackStats.max
    const stackIndexPercent = stacks.length > 1 ? (stacks.indexOf(stack) / (stacks.length - 1)) : 0
    const stackSizePercent = (mircleLinesByStack.get(stack)||[]).length / mircleLines.length
    const stackPercent = stackMaxPercent * 0.5 + stackIndexPercent * 0.5

    // const isStackPrime = primeFactors(stack).length === 1
    // const isModuloPrime = primeFactors(modulo).length === 1

    const l = (1 - lineRadiusPercent) * 0.7 + 0.3
    const c = 0.5//(1 - stackMaxPercent) * 0.4 + 0.1
    const h = (1 - lineDistancePercent ** 9) * 100 + 170
    const a = math.clamp((stackMaxPercent * (1 - stackSizePercent) * 0.9 + 0.02 * densityMultiplier), 0, 1)

    return {
      ...line,
      color: `oklch(${l} ${c} ${h} / ${a})`,
      thickness: 1 + stackPercent * 2 * (densityMultiplier / 2),
    }
  })

  console.debug('Drawing background...')
  ctx.globalCompositeOperation = 'source-over'
  drawGradientCircle({ ctx, radius, gradient: { 0: '#11F8', 1: '#F001' } })
  drawGradientCircle({ ctx, radius, gradient: { 0.5: '#0000', 1: '#F0F4' } })
  drawGradientCircle({ ctx, radius, gradient: { 0: '#FA1', 0.5: '#1850' } })

  console.debug('Drawing lines...')
  ctx.globalCompositeOperation = 'lighter' // colors are added together (ex: #808 + #FF0 = #FF8)
  drawLines({
    ctx,
    lines: styledLines,
    onProgress: progress => onProgress && onProgress(progress.current / progress.total),
  })
  // drawGradientLines({
  //   ctx,
  //   lines: styledLines.map(line => ({ ...line, gradient: { 0: '#40F0', 0.3: line.color, 0.7: line.color, 1: '#40F0' } })),
  //   onProgress: progress => onProgress && onProgress(progress.current / progress.total),
  // })

  // TODO utilize density
  // TODO smarter thickness/opacity distribution (see modulo 47, 48, 49)

  console.debug('Shading...')
  ctx.globalCompositeOperation = 'source-atop' // draw new content within old content (as if the old content reveals the new content)
  drawGradientCircle({ ctx, radius, gradient: { 0.6: '#0000', 1: '#000' } })
  // drawGradientCircle({ ctx, radius, gradient: { 0: '#F000', 1: '#00F' } })
  ctx.globalCompositeOperation = 'destination-over' // draw new content under old content (as if the new content was there first)
  // drawGradientCircle({ ctx, radius, gradient: { 0: '#FA08', 1: '#00F0' } })
  // drawGradientCircle({ ctx, radius, gradient: { 0: '#C31', 1: '#104' } })


  console.debug('Drawing accents...')
  ctx.globalCompositeOperation = 'lighter'
  drawLines({
    ctx,
    lines: styledLines.map(line => ({
      ...line,
      color: `rgb(255 0 0 / ${(line.multiples.length / stackStats.max) ** 1.8})`,
    }))
  })

  // console.debug('Inverting...')
  // ctx.globalCompositeOperation = 'difference'
  // draw.circle({ ctx, pos: { x: 0, y: 0 }, r: radius, color: '#FFF' })

  console.debug('Cropping...')
  ctx.globalCompositeOperation = 'destination-in' // crop old content to new content (as if new content defines the shape)
  draw.circle({ ctx, pos: { x: 0, y: 0 }, r: radius - 1, color: '#000' })
  ctx.globalCompositeOperation = 'destination-over' // draw new content under old content (as if the new content was there first)
  drawBackground({ ctx, color: '#000' })
}
