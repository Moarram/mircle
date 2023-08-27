
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
 * ...settings...
 * 
 * @returns {StyledLine[]} - array of drawable lines
 */
export function styleMircle({ lines }) {
  return lines.map(line => ({
    ...line,
    color: '#FDA',
    opacity: .5,
    thickness: 3,
  }))
}