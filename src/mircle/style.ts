import type { Grouped, MircleLine, Point } from './layout'

// TODO opacity + thickness based roughly on number of lines
// TODO figure out how to map weighted factors to style (color, thickness, opacity)
// TODO add style before or after computing positions (for distance? color budget?)
// TODO color based on common multiples, unique color for each number

export type StyledLine = {
  pos: Point, // start position
  pos2: Point, // end position
  color: string,
  color2?: string, // optional for gradient
  opacity?: number, // alpha channel [0..1]
  thickness?: number, // width of line
}

export type LineStyleConfig = {
  // TODO
}

export type StyleMircleArgs = {
  lines: Grouped<MircleLine>[],
  modulo: number,
  styles: LineStyleConfig,
}
export function styleMircleLines({ lines, modulo, styles }: StyleMircleArgs): StyledLine[] {
  const max = lines.reduce((acc, line) => Math.max(line.occurrences, acc), 0)
  return lines.map(line => ({
    ...line,
    // color: '#00000003',
    color: `rgba(0,0,0,${line.occurrences / max})`,
    thickness: 1 + (line.occurrences / max) * 20
  }))
  // return addStyle({ lines, modulo }) // TODO a lot more style things
}

type AddStyleArgs = {
  lines: Grouped<MircleLine>[],
  modulo: number,
}
function addStyle({ lines, modulo }: AddStyleArgs): StyledLine[] {
  // TODO bugged when multiple = 4?
  const occurrencesTotals: Record<number,number> = {} // the number of lines with the same occurrences value
  const occurrencesList: number[] = []
  let occurrencesMax = 0
  lines.forEach(({ occurrences }) => {
    if (!(occurrences in occurrencesTotals)) {
      occurrencesTotals[occurrences] = 0
      occurrencesList.push(occurrences)
      occurrencesMax = Math.max(occurrences, occurrencesMax)
    }
    occurrencesTotals[occurrences] += 1
  })
  occurrencesList.sort((a, b) => a - b)

  // console.debug(occurrencesTotals)

  const percentOfMax = (occurrences: number) => occurrences / occurrencesMax
  const percentOfList = (occurrences: number) => occurrencesList.indexOf(occurrences) / (occurrencesList.length - 1)
  const percentOfTotal = (occurrences: number) => occurrencesTotals[occurrences] / occurrencesTotals[1]

  return lines.map(line => {
    let color = { r: 0, g: 0, b: 0, a: 0 }
    let thickness = 1
    switch (line.occurrences) {
      case 0:
        color = { r: 200, g: 50, b: 150, a: .1 }
        break

      // case 1:
      //   color = { r: 50, g: 150, b: 255, a: .1 }
      //   break

      default:
        color = {
          r: (1 - percentOfTotal(line.occurrences)) * 180 + 10,
          g: percentOfList(line.occurrences) * 50,
          b: (1 - percentOfList(line.occurrences)) * 140 + 10,
          a: .1 + percentOfList(line.occurrences) * .5,
        }
        thickness = 1 + percentOfMax(line.occurrences) * 13
    }
    return {
      ...line,
      color: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
      thickness,
    }
  })
}