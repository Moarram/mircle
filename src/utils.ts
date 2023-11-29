
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
