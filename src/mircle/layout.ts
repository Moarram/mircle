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
  const connections = computeConnections({ modulo, multiple })
  const lines = connections.map(connection => ({
    ...connection,
    ...computeLine({ connection, modulo, radius, origin })
  }))
  return lines
}

export type LayoutGroupedMircleArgs = {
  modulo: number, // number of points around the circle
  radius: number, // radius of circle
  origin?: Position, // center of circle
}
export function layoutGroupedMircle({ modulo, radius, origin={x:0,y:0} }: LayoutGroupedMircleArgs): GroupedMircleLine[] {
  // TODO re-write to use Map() and group util
  const connectionsByMultiple: Record<number, MircleConnection[]> = {}
  for (let multiple = 0; multiple < modulo; multiple++) {
    connectionsByMultiple[multiple] = computeConnections({ modulo, multiple })
  }

  const groups: Record<number,Record<number,number[]>> = {} // maps start -> end -> [multiples]
  Object.entries(connectionsByMultiple).forEach(([key, connections]) => {
    const multiple = parseFloat(key)
    connections.forEach(({ start, end }) => {
      if (!(start in groups)) groups[start] = {}
      if (!(end in groups[start])) groups[start][end] = []
      if (groups[start][end].includes(multiple)) return // continue
      groups[start][end].push(multiple)
    })
  })

  const groupedConnections: GroupedMircleConnection[] = []
  Object.entries(groups).forEach(([startKey, endVal]) => {
    Object.entries(endVal).forEach(([endKey, multiples]) => {
      groupedConnections.push({
        start: parseFloat(startKey),
        end: parseFloat(endKey),
        multiples,
      })
    })
  })

  const groupedLines = groupedConnections.map(connection => ({
    ...connection,
    ...computeLine({ connection, modulo, radius, origin }),
  }))

  return groupedLines.sort((a, b) => a.multiples.length - b.multiples.length)
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
