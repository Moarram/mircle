
/**
 * @typedef {Object} Point
 * @property {number} x - horizontal offset from left
 * @property {number} y - vertical offset from top
 */

/**
 * @typedef {Object} MircleLine
 * @property {Point} pos - start position
 * @property {Point} pos2 - end position
 * @property {number} start - start radians
 * @property {number} end - end radians
 * @property {number} count - number of occurences of this line (including reverse)
 */

/**
 * Layout
 * 
 * @param {number} modulo - number of points around the circle
 * @param {number} size - width and height of image
 * @param {number} [padding=10] - space between circle and edge of image
 * 
 * @returns {MircleLine[]} - array of lines
 */
export function layoutMircle({ modulo, size, padding=10 }) {
  return [{
    pos: { x: 40, y: 55 },
    pos2: { x: -200, y: 0 },
    // ...
  }]
}
