import { Colorful, math } from '@moarram/util'
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
  missing: string, // color of missing lines
  one: string, // color of lines with fewest occurrences
  many: string, // color of lines with most occurrences
  short: string, // color of short lines
  minWidth: number, // width of lines with fewest occurences
  maxWidth: number, // width of lines with most occurrences
  //...
}

export type StyleMircleArgs = {
  lines: Grouped<MircleLine>[],
  modulo: number,
  styles: LineStyleConfig,
}
export function styleMircleLines({ lines, modulo, styles }: StyleMircleArgs): StyledLine[] {
  const occurrenceMax = lines.reduce((acc, line) => Math.max(line.occurrences, acc), 0)
  const distanceMax = lines.reduce((acc, line) => Math.max(math.distance(line.pos, line.pos2), acc), 0)

  return lines.map(line => {
    const occurrencePercent = math.clamp(occurrenceMax === 2 ? .2 : line.occurrences / occurrenceMax * 3, 0 ,1)
    const occurrenceColor = line.occurrences ? Colorful.scale([styles.one, styles.many], occurrencePercent).toString() : styles.missing

    const distancePercent = math.distance(line.pos, line.pos2) / distanceMax
    const distanceColor = Colorful.scale([styles.short, occurrenceColor], distancePercent).toString()

    return {
      ...line,
      // color: '#FFF2',
      color: distanceColor,
      thickness: styles.minWidth + occurrencePercent * (styles.maxWidth - styles.minWidth),
    }
  })
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
