
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
