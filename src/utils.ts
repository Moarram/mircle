import type { Position } from './types'

/** An ongoing activity has been cancelled */
export class AbortError extends Error {}

/**
 * Compute the prime factorization of a number
 *
 * @example
 * primeFactors(24) -> [2, 2, 2, 3]
 */
export function primeFactors(n: number): number[] {
  const factors = []
  let divisor = 2
  while (n >= 2) {
    if (n % divisor === 0) {
      factors.push(divisor)
      n = n / divisor
    } else {
      divisor++
    }
  }
  return factors
}

export type Statistics = {
  count: number,
  min: number,
  max: number,
  mean: number,
  median: number,
  stdev: number,
  sum: number,
}
/**
 * Compute some statistics about an array of numbers
 *
 * (count, min, max, mean, median, stdev, sum)
 *
 * @example
 * statistics([1, 2, 3]).stdev -> 0.8165...
 */
export function statistics(values: number[]): Statistics {
  const count = values.length
  if (!count) return { count: 0, min: 0, max: 0, mean: 0, median: 0, stdev: 0, sum: 0 }
  const vals = [...values].sort((a, b) => a - b)
  const min = vals.at(0) || 0
  const max = vals.at(-1) || 0
  const sum = vals.reduce((acc, val) => val + acc, 0)
  const mean = sum / count
  const median = ((vals.at(Math.floor(count / 2)) || 0) + (vals.at(Math.ceil(count / 2)) || 0)) / 2
  const variance = vals.reduce((acc, val) => (mean - val) ** 2 + acc) / count
  const stdev = Math.sqrt(variance)
  return { count, min, max, mean, median, stdev, sum }
}

/**
 * Group items by specified key
 *
 * @example
 * const grouped = group(['a1', 'a2', 'b1'], s => s[1]) // group by second char
 * grouped.get('1') -> ['a1', 'b1']
 * grouped.get('2') -> ['a2']
 */
export function group<K, T>(items: T[], toKey: (item: T) => K): Map<K, T[]> {
  const grouped = new Map()
  items.forEach(item => {
    const key = toKey(item)
    if (grouped.has(key)) {
      grouped.get(key).push(item)
    } else {
      grouped.set(key, [item])
    }
  })
  return grouped
}

/** Compute the slope of a line */
export function slope(pos: Position, pos2: Position) {
  if (pos.x === pos2.x) return undefined // vertical line
  return (pos2.y - pos.y) / (pos2.x - pos.x)
}

/** Wait for specified number of animation frames */
export async function delayFrames(n: number) {
  for (let i = 0; i < n; i++) {
    await new Promise(resolve => window.requestAnimationFrame(resolve))
  }
}

/** Download a canvas as PNG image */
export async function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  console.debug('Generating blob...')
  const blob = await new Promise<Blob|null>(resolve => canvas.toBlob(resolve))
  if (!blob) {
    console.error('Failed to create blob')
    return
  }
  console.debug('Downloading...')
  await downloadBlob(blob, filename)
  console.debug('Done!')
}

/** Download a blob of data */
export async function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href) // cleanup
}
