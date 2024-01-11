import { math, type Position } from '@moarram/util'

export type Line = {
  pos: Position, // start position
  pos2: Position, // end position
}

export type MircleConnection = {
  start: number,
  end: number,
}

export type GroupedMircleConnection = MircleConnection & {
  multiples: number[], // every multiple that defines this line
}

export type MircleLine = Line & MircleConnection
export type GroupedMircleLine = Line & GroupedMircleConnection

export type LayoutMircleArgs = {
  modulo: number, // number of points around the circle
  multiple: number, // multiplier to find second point
  radius: number, // radius of circle
  origin?: Position, // center of circle
}
export function layoutMircle({ modulo, multiple, radius, origin={x:0,y:0} }: LayoutMircleArgs): MircleLine[] {
  const result: MircleLine[] = []
  for (let start = 0; start < modulo; start++) {
    const end = (start * multiple) % modulo // compute connection
    result.push({
      start,
      end,
      ...computeLine({ connection: { start, end }, modulo, radius, origin })
    })
  }
  return result
}

export function layoutSparseGroupedMircle({ modulo, multiple, radius, origin={x:0,y:0} }: LayoutMircleArgs): GroupedMircleLine[] {
  const groups: Map<number,Set<number>>[] = [] // maps start -> end -> multiples
  for (let start = 0; start < modulo; start++) {
    groups.push(new Map()) // maps end -> multiples
  }

  const desiredConnections: number[] = [] // maps start -> end
  for (let start = 0; start < modulo; start++) {
    const end = (start * multiple) % modulo // compute connection
    desiredConnections[start] = end
  }

  for (let m = 0; m < modulo; m++) {
    for (let start = 0; start < modulo; start++) {
      const end = (start * m) % modulo // compute connection
      const desiredEnd = desiredConnections[start]
      if (end !== desiredEnd) continue // ignore undesired connections
      const ends = groups[start]
      if (!ends.has(end)) ends.set(end, new Set())
      ends.get(end)?.add(m)
    }
  }

  const result: GroupedMircleLine[] = []
  for (let start = 0; start < modulo; start++) {
    const ends = groups[start]
    for (const [end, multiples] of ends) {
      if (start === end) continue // omit loops
      result.push({
        start,
        end,
        multiples: Array.from(multiples),
        ...computeLine({ connection: { start, end }, modulo, radius, origin }),
      })
    }
  }

  return result.sort((a, b) => a.multiples.length - b.multiples.length)
}

export type LayoutGroupedMircleArgs = {
  modulo: number, // number of points around the circle
  radius: number, // radius of circle
  origin?: Position, // center of circle
}
export function layoutGroupedMircle({ modulo, radius, origin={x:0,y:0} }: LayoutGroupedMircleArgs): GroupedMircleLine[] {
  const groups: Map<number,Set<number>>[] = [] // maps start -> end -> multiples
  for (let start = 0; start < modulo; start++) {
    groups.push(new Map()) // maps end -> multiples
  }

  for (let m = 0; m < modulo; m++) {
    for (let start = 0; start < modulo; start++) {
      const end = (start * m) % modulo // compute connection
      const ends = groups[start]
      if (!ends.has(end)) ends.set(end, new Set())
      ends.get(end)?.add(m)
    }
  }

  const result: GroupedMircleLine[] = []
  for (let start = 0; start < modulo; start++) {
    const ends = groups[start]
    for (const [end, multiples] of ends) {
      if (start === end) continue // omit loops
      result.push({
        start,
        end,
        multiples: Array.from(multiples),
        ...computeLine({ connection: { start, end }, modulo, radius, origin }),
      })
    }
  }

  return result.sort((a, b) => a.multiples.length - b.multiples.length)
}

type ComputeLineArgs = {
  connection: MircleConnection,
  modulo: number,
  radius: number,
  origin?: Position,
  rotation?: number, // radians
}
function computeLine({ connection, modulo, radius, origin={x:0,y:0}, rotation=(-Math.PI/2) }: ComputeLineArgs): Line {
  const ang = (connection.start / modulo) * Math.PI * 2 + rotation
  const ang2 = (connection.end / modulo) * Math.PI * 2 + rotation
  return {
    pos: math.cartesian({ ang: ang, mag: radius }, origin),
    pos2: math.cartesian({ ang: ang2, mag: radius }, origin),
  }
}
