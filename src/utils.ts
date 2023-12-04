
export class AbortError extends Error {}

// compute the prime factorization of a number (eg: 24 = 2×2×2×3)
export function primeFactors(n: number): number[] {
  const factors = [];
  let divisor = 2;
  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  return factors;
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
// compute some statistics about a list of numbers
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

// map each value to the count
export function group(values: number[]) {
  const grouped: Map<number, number> = new Map()
  values.forEach(value => {
    const existing = grouped.get(value) || 0
    grouped.set(value, existing + 1)
  })
  return grouped
}

// wait for specified number of animation frames
export async function delayFrames(n: number) {
  for (let i = 0; i < n; i++) {
    await new Promise(resolve => window.requestAnimationFrame(resolve))
  }
}

// download a canvas as PNG
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

// download a blob
export async function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href) // cleanup
}
