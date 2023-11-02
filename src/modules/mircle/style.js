
/**
 * @typedef {Object} StyledLine
 * @property {Point} pos - start position
 * @property {Point} pos2 - end position
 * @property {string} color - color
 * @property {string} [color2] - optional second color for gradient
 * @property {number} [opacity=1] - alpha channel
 * @property {number} [thickness=1] - width of line
 */

/**
 * Style
 *
 * @param {MircleLine[]} lines - array of lines
 * @param {number} modulo - number of points around the circle
 * ...settings...
 *
 * @returns {StyledLine[]} - array of drawable lines
 */
export function styleMircle({ modulo, lines }) {
  addStyle(lines, modulo)
  return lines
}

function addStyle(links, modulo) {
  const occurrencesTotals = {} // the number of links with the same occurrences value
  let occurrencesList = []
  let occurrencesMax = 0
  links.forEach(({ occurrences }) => {
    if (!(occurrences in occurrencesTotals)) {
      occurrencesTotals[occurrences] = 0
      occurrencesList.push(occurrences)
      occurrencesMax = Math.max(occurrences, occurrencesMax)
    }
    occurrencesTotals[occurrences] += 1
  })
  occurrencesList.sort((a, b) => a - b)

  // console.debug(occurrencesTotals)

  const percentOfMax = (occurrences) => occurrences / occurrencesMax
  const percentOfList = (occurrences) => occurrencesList.indexOf(occurrences) / (occurrencesList.length - 1)
  const percentOfTotal = (occurrences) => occurrencesTotals[occurrences] / occurrencesTotals[1]

  links.forEach(link => {
    let color = { r: 0, g: 0, b: 0, a: 0 }
    let thickness = 1
    switch (link.occurrences) {
      case 0:
        color = { r: 200, g: 50, b: 150, a: .1 }
        break

      // case 1:
      //   color = { r: 50, g: 150, b: 255, a: .1 }
      //   break

      default:
        color = {
          r: (1 - percentOfTotal(link.occurrences)) * 180 + 10,
          g: percentOfList(link.occurrences) * 50,
          b: (1 - percentOfList(link.occurrences)) * 140 + 10,
          a: .1 + percentOfList(link.occurrences) * .5,
        }
        thickness = 1 + percentOfMax(link.occurrences) * 13
    }
    link.color = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
    // link.color = '#000'
    link.thickness = thickness
  })
}