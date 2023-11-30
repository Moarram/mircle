import { math } from '@moarram/util'

export type Point = {
  x: number, // horizontal offset from left
  y: number, // vertical offset from top
}

export type Line = {
  pos: Point, // start position
  pos2: Point, // end position
}

export type MircleConnection = {
  start: number,
  end: number,
}

export type MircleLine = Line & MircleConnection

export type Grouped<T> = T & {
  occurrences: number,
}

export type LayoutMircleArgs = {
  modulo: number, // number of points around the circle
  multiple?: number, // mutliplier for modulo to find second points, otherwise all
  size: number, // width and height of image
  padding?: number, // space between circle and edge of image
}
export function layoutMircle({ modulo, multiple, size, padding=0 }: LayoutMircleArgs): Grouped<MircleLine>[] {
  const connections: MircleConnection[] = []
  if (multiple !== undefined) {
    connections.push(...computeConnections({ modulo, multiple }))
  } else {
    for (let multiple = 0; multiple < modulo; multiple++) {
      connections.push(...computeConnections({ modulo, multiple }))
    }
  }
  const groupedConnections = groupConnections({ connections, modulo, includeMissing: true })
  const radius = (size - padding * 2) / 2
  const groupedLines = groupedConnections.map(connection => ({
    ...connection,
    ...computeLine({ connection, modulo, radius }),
  }))

  return groupedLines //.sort((a, b) => math.distance(a.pos, a.pos2) - math.distance(b.pos, b.pos2))
}

type ComputeConnectionsArgs = {
  modulo: number,
  multiple: number,
}
function computeConnections({ modulo, multiple }: ComputeConnectionsArgs): MircleConnection[] {
  const connections = []
  for (let start = 0; start < modulo; start++) {
    const end = (start * multiple) % modulo
    if (start !== end) connections.push({ start, end })
  }
  return connections
}

type GroupConnectionsArgs = {
  connections: MircleConnection[],
  modulo: number,
  includeMissing?: boolean,
}
function groupConnections({ connections, modulo, includeMissing }: GroupConnectionsArgs): Grouped<MircleConnection>[] {
  const groups: Record<number,Record<number,number>> = {} // { start: { end: n, end2: n, ... }, start2: {}, ... }
  connections.forEach(connection => {
    const start = Math.min(connection.start, connection.end)
    const end = Math.max(connection.start, connection.end)
    if (!(start in groups)) groups[start] = {}
    if (!(end in groups[start])) groups[start][end] = 0
    groups[start][end] += 1
  })
  const grouped: Grouped<MircleConnection>[] = []
  for (let start = 0; start < modulo; start++) {
    for (let end = start; end < modulo; end++) {
      const occurrences = (start in groups && end in groups[start]) ? groups[start][end] : 0
      // if (occurrences) {
      if ((occurrences || includeMissing) && start !== end) {
        grouped.push({ start, end, occurrences })
      }
    }
  }
  grouped.sort((a, b) => a.start - b.start)
  grouped.sort((a, b) => a.occurrences - b.occurrences)
  return grouped
}

type ComputeLineArgs = {
  connection: MircleConnection,
  modulo: number,
  radius: number,
  origin?: Point,
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
