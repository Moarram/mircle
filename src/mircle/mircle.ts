import { layoutGroupedMircle, layoutMircle, type GroupedMircleLine, type MircleLine, type Line, layoutSparseGroupedMircle } from './layout'
import { initCanvas, drawGradientCircle, drawLines, drawBackground, type StyledLine } from './draw'
import type { WorkerRequest, WorkerResponse } from './worker'
import { AbortError, delayFrames, group, primeFactors, statistics } from '@/utils'
import { draw, math } from '@moarram/util'

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
  style?: 'fancy' | 'plain',
  crop?: boolean, // whether to crop image to circle
  labels?: boolean, // whether to print labels around the circle
}
export type RenderMircleArgs = {
  canvas: HTMLCanvasElement | OffscreenCanvas, // destination canvas
  specification: MircleSpecification,
  onProgress?: (progressPercent: number) => void,
}
// Render mircle on canvas
export function renderMircle({ canvas, specification: { size, modulo, multiple, padding=0, style, crop, labels=true }, onProgress }: RenderMircleArgs) {
  console.debug('Preparing canvas...')
  const ctx = initCanvas({ canvas, size, alpha: true })

  console.debug('Computing lines...')
  const labelMaxChars = labels ? `${modulo}`.length : 0
  const labelFontSize = 24
  const labelSize = Math.max(labelMaxChars, 2) * labelFontSize * 0.6
  const radius = size / 2 - padding - labelSize

  const mircleLines = multiple === undefined ? layoutGroupedMircle({ modulo, radius }) : layoutSparseGroupedMircle({ modulo, multiple, radius })
  const densityMultiplier = computeDensityMultiplier(mircleLines, radius, 10)
  console.debug(`lines: ${mircleLines.length}, density: ${densityMultiplier}`)

  let styledLines = styleGroupedMircleLines(mircleLines, densityMultiplier)
  let accentLines = accentGroupedMircleLines(mircleLines, densityMultiplier)

  const vertexVisits: number[] = Array(modulo).fill(0)
  mircleLines.forEach(({ start, end, multiples }) => {
    vertexVisits[start] += multiples.length ** 3
    vertexVisits[end] += multiples.length ** 3
  })

  if (style === 'plain') {
    styledLines = styledLines.map(line => {
      const alpha = multiple === undefined ? line.color?.split('/').at(-1) || ' 1)' : Math.min(1000 / modulo, 0.7) + 1 / 255
      return { ...line, color: `rgb(255 255 255 /${alpha}`, thickness: 1 }
    })
    accentLines = []
  }

  if (style === 'fancy') {
    console.debug('Drawing background...')
    // Note: Making this gradient took a lot of finagling... be warned
    ctx.globalCompositeOperation = 'source-over' // default
    drawGradientCircle({ ctx, radius, gradient: { 0: '#11F8', 1: '#F001' } })
    drawGradientCircle({ ctx, radius, gradient: { 0.5: '#0000', 1: '#F0F4' } })
    drawGradientCircle({ ctx, radius, gradient: { 0: '#FA1', 0.5: '#1850' } })
  }

  console.debug('Drawing lines...')
  ctx.globalCompositeOperation = 'lighter' // colors are added together (ex: #808 + #FF0 = #FF8)
  drawLines({
    ctx,
    lines: styledLines,
    onProgress: progress => onProgress && onProgress(progress.current / (styledLines.length + accentLines.length)),
  })

  if (style === 'fancy') {
    console.debug('Shading...')
    ctx.globalCompositeOperation = 'source-atop' // draw new content within old content (as if the old content reveals the new content)
    drawGradientCircle({ ctx, radius, gradient: { 0.6: '#0000', 1: '#000' } })
  }

  if (style === 'fancy') {
    console.debug('Drawing accents...')
    ctx.globalCompositeOperation = 'lighter'
    drawLines({
      ctx,
      lines: accentLines,
      onProgress: progress => onProgress && onProgress((progress.current + styledLines.length) / (styledLines.length + accentLines.length)),
    })
  }

  // console.debug('Inverting...')
  // ctx.globalCompositeOperation = 'difference'
  // draw.circle({ ctx, pos: { x: 0, y: 0 }, r: radius, color: '#FFF' })

  console.debug('Cropping...')
  ctx.globalCompositeOperation = 'destination-in' // crop old content to new content (as if new content defines the shape)
  draw.circle({ ctx, pos: { x: 0, y: 0 }, r: radius - 1, color: '#000' })
  ctx.globalCompositeOperation = 'destination-over' // draw new content under old content (as if the new content was there first)
  if (crop) {
    draw.circle({ ctx, pos: { x: 0, y: 0 }, r: size / 2, color: '#000' })
  } else {
    drawBackground({ ctx, color: '#000' })
  }

  if (labels === true) {
    console.debug('Drawing labels...')
    ctx.globalCompositeOperation = 'source-over' // default
    const labelMircle = layoutMircle({ modulo, multiple: 1, radius: radius + labelSize * 0.75 })
    const spacing = labelMircle.length > 1 ? math.distance(labelMircle[0].pos, labelMircle[1].pos) : radius
    const vertexStats = statistics(vertexVisits) // TODO get this info while computing accents?
    const isPrime = primeFactors(modulo).length === 1
    const isPlainLayer = style === 'plain' && multiple !== undefined
    labelMircle.forEach(({ start, pos }) => {
      if (start !== 0 && (isPrime || isPlainLayer) && spacing < labelSize) return // labels all overlap, continue
      const alpha = start === 0 ? 1 : isPrime || isPlainLayer ? 0.3 : math.clamp((vertexVisits[start] ** 1.3) / vertexStats.max, 0, 1)
      if (!alpha || alpha < 0.1) return // label too faint, continue
      const label = `${start}`
      const x = pos.x - labelFontSize * 0.3 * label.length
      const y = pos.y - labelFontSize * 0.6
      const color = `rgb(255 255 255 / ${alpha})`
      draw.text({ ctx, pos: { x, y }, msg: label, size: labelFontSize, font: '"Fira Code", monospace', color })
    })
  }
}

function computeDensityMultiplier(lines: MircleLine[], radius: number, densityTarget: number) {
  const totalDistance = statistics(lines.map(line => math.distance(line.pos, line.pos2))).sum
  const density = totalDistance / (Math.PI * radius ** 2) // average number of lines over each pixel
  return math.clamp(densityTarget / (density + 1), 0.01, 10) // multiplier to reach target density
}

type LineInfo = {
  radius: number, // distance from center of circle to midpoint of line
  radiusPercent: number, // percent of max radius
  distance: number, // length of line
  distancePercent: number, // percent of max distance
}
function withLineInfo<T>(lines: (Line & T)[]): (Line & T & LineInfo)[] {
  const radiusStats = statistics(lines.map(line => math.distance({ x: 0, y: 0 }, math.midpoint(line.pos, line.pos2))))
  const distanceStats = statistics(lines.map(line => math.distance(line.pos, line.pos2)))
  return lines.map(line => {
    const radius = math.distance({ x: 0, y: 0 }, math.midpoint(line.pos, line.pos2))
    const radiusPercent = radius / radiusStats.max
    const distance = math.distance(line.pos, line.pos2)
    const distancePercent = distance / distanceStats.max
    return { ...line, radius, radiusPercent, distance, distancePercent }
  })
}

type StackInfo = {
  stack: number, // how many multiples define this line
  stackMaxPercent: number, // percent of max stack value
  stackIndexPercent: number, // percent of last index
  stackSize: number, // how many lines have this same number of multiples
  stackSizePercent: number, // percent of lines with this same number of multiples
}
function withStackInfo(lines: GroupedMircleLine[]): (GroupedMircleLine & StackInfo)[] {
  const linesByStack = group(lines, line => line.multiples.length) // maps stack to lines
  const stacks = [...linesByStack.keys()].sort((a, b) => a - b) // ascending order
  const stackStats = statistics(stacks)
  return lines.map(line => {
    const stack = line.multiples.length // how many multiples define this line
    const stackMaxPercent = stack / stackStats.max
    const stackIndexPercent = stacks.length > 1 ? (stacks.indexOf(stack) / (stacks.length - 1)) : 0
    const stackSize = (linesByStack.get(stack)||[]).length // how many lines have this same number of multiples
    const stackSizePercent = stackSize / lines.length
    return { ...line, stack, stackMaxPercent, stackIndexPercent, stackSize, stackSizePercent }
  })
}

function styleMircleLines(lines: MircleLine[], densityMultiplier: number): StyledLine[] {
  const result: StyledLine[] = []
  withLineInfo(lines).forEach(line => {
    const { radiusPercent, distancePercent } = line

    const l = (1 - radiusPercent) * 0.7 + 0.3
    const h = (1 - distancePercent ** 9) * 100 + 170
    const a = math.clamp((0.05 + 0.3 * densityMultiplier), 0, 1)
    const w = 1 + 0.5 * densityMultiplier

    result.push({
      pos: line.pos,
      pos2: line.pos2,
      color: `oklch(${l} 0.5 ${h} / ${a})`,
      thickness: w,
    })
  })
  return result
}

function styleGroupedMircleLines(lines: GroupedMircleLine[], densityMultiplier: number): StyledLine[] {
  const result: StyledLine[] = []
  withLineInfo(withStackInfo(lines)).forEach(line => {
    const { radiusPercent, distancePercent, stackMaxPercent, stackIndexPercent, stackSizePercent } = line

    const l = (1 - radiusPercent) * 0.7 + 0.3
    const h = (1 - distancePercent ** 9) * 100 + 170
    const a = math.clamp((stackMaxPercent * (1 - stackSizePercent) * 0.9 + 0.02 * densityMultiplier), 0, 1)
    const w = 1 + (stackMaxPercent * 0.5 + stackIndexPercent * 0.5) * densityMultiplier

    result.push({
      pos: line.pos,
      pos2: line.pos2,
      color: `oklch(${l} 0.5 ${h} / ${a})`,
      thickness: w,
    })
  })
  return result
}

function accentGroupedMircleLines(lines: GroupedMircleLine[], densityMultiplier: number): StyledLine[] {
  const result: StyledLine[] = []
  withLineInfo(withStackInfo(lines)).forEach(line => {
    const { stackMaxPercent, stackIndexPercent, stackSizePercent } = line

    const adjust = (253/255 - stackSizePercent * math.clamp(lines.length / 1500, 0, 1)) ** 4 + 2/255 // reduce opacity when lots of lines in stack (namely prime numbers) and increase when low number of total lines (1500 is around mod 50)
    const a = math.clamp(stackMaxPercent ** 1.6, 0, 1) * adjust
    const w = 1 + (stackMaxPercent * 0.5 + stackIndexPercent * 0.5) * densityMultiplier

    if (a >= 1 / 255) {
      result.push({
        pos: line.pos,
        pos2: line.pos2,
        color: `rgb(255 25 25 / ${a})`,
        thickness: w,
      })
    }
  })
  return result
}
