import { TinyColor } from "@ctrl/tinycolor";
import { math } from "@moarram/util";

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

export async function delayFrames(n: number) {
  for (let i = 0; i < n; i++) {
    await new Promise(resolve => window.requestAnimationFrame(resolve))
  }
}

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

export async function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href) // cleanup
}

// Get a color % of the way through an array of colors, blending as necessary
export function scaleColor(colors: string[], percent: number): string {
  const target = math.clamp(percent, 0, 1) * (colors.length - 1)
  const remain = Math.ceil(target) - target
  const color = new TinyColor(colors[Math.max(Math.floor(target), 0)]).toRgb()
  const color2 = new TinyColor(colors[Math.min(Math.ceil(target), colors.length - 1)]).toRgb()
  return new TinyColor({
    r: color.r * remain + color2.r * (1 - remain),
    g: color.g * remain + color2.g * (1 - remain),
    b: color.b * remain + color2.b * (1 - remain),
    a: color.a * remain + color2.a * (1 - remain),
  }).toHex8String()
}