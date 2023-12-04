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

export type GroupedMircleConnection = MircleConnection & {
  count: number, // how many times this line appears
  multiples?: number[], // every multiple that defines this line
}

export type MircleLine = Line & MircleConnection
export type GroupedMircleLine = Line & GroupedMircleConnection

// TODO allow non-integer modulo

export type LayoutMircleArgs = {
  modulo: number, // number of points around the circle
  multiple?: number, // optional multiple of modulo, otherwise all
  radius: number, // radius of circle
  origin?: Point, // center of circle
}
export function layoutMircle({ modulo, multiple, radius, origin={x:0,y:0} }: LayoutMircleArgs): GroupedMircleLine[] {
  const connectionsByMultiple: Record<number, MircleConnection[]> = {}
  if (multiple !== undefined) {
    connectionsByMultiple[multiple] = computeConnections({ modulo, multiple })
  } else {
    for (let multiple = 0; multiple < modulo; multiple++) {
      connectionsByMultiple[multiple] = computeConnections({ modulo, multiple })
    }
  }

  const groups: Record<number,Record<number,{count:number,multiples:number[]}>> = {} // maps start -> end -> { count, multiples }
  Object.entries(connectionsByMultiple).forEach(([key, connections]) => {
    const multiple = parseFloat(key)
    connections.forEach(({ start, end }) => {
      if (!(start in groups)) groups[start] = {}
      if (!(end in groups[start])) groups[start][end] = { count: 0, multiples: [] }
      groups[start][end].count += 1
      if (groups[start][end].multiples.includes(multiple)) return // continue
      groups[start][end].multiples.push(multiple)
    })
  })

  const groupedConnections: GroupedMircleConnection[] = []
  Object.entries(groups).forEach(([startKey, endVal]) => {
    Object.entries(endVal).forEach(([endKey, group]) => {
      groupedConnections.push({
        start: parseFloat(startKey),
        end: parseFloat(endKey),
        ...group,
      })
    })
  })

  const groupedLines = groupedConnections.map(connection => ({
    ...connection,
    ...computeLine({ connection, modulo, radius, origin }),
  }))

  return groupedLines
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
