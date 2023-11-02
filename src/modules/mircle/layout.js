
/**
 * @typedef {Object} Point
 * @property {number} x - horizontal offset from left
 * @property {number} y - vertical offset from top
 */

import { math } from "@moarram/util"

/**
 * @typedef {Object} MircleLine
 * @property {Point} pos - start position
 * @property {Point} pos2 - end position
 * @property {number} start - start radians
 * @property {number} end - end radians
 * @property {number} occurences - duplicates of this line (including reverse)
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
  const links = []
  for (let multiple = 0; multiple < modulo; multiple++) {
    links.push(...computeLinks(modulo, multiple))
  }
  const groupedLinks = groupLinks(links, modulo)
  groupedLinks.sort((a, b) => a.start - b.start)
  groupedLinks.sort((a, b) => a.occurrences - b.occurrences)

  const radius = (size - padding * 2) / 2
  const lines = computePositions(groupedLinks, modulo, radius)
  return lines
}

function computeLinks(modulo, multiple) {
  const links = []
  for (let start = 0; start < modulo; start++) {
    const end = (start * multiple) % modulo
    links.push({ start, end })
  }
  return links
}

function groupLinks(links, modulo) {
  const groups = {} // { start: { end: n, end2: n, ... }, start2: {}, ... }
  links.forEach(link => {
    const start = Math.min(link.start, link.end)
    const end = Math.max(link.start, link.end)
    if (!(start in groups)) groups[start] = {}
    if (!(end in groups[start])) groups[start][end] = 0
    groups[start][end] += 1
  })
  const grouped = []
  for (let start = 0; start < modulo; start++) {
    for (let end = start; end < modulo; end++) {
      const occurrences = (start in groups && end in groups[start]) ? groups[start][end] : 0
      grouped.push({ start, end, occurrences })
    }
  }
  return grouped
}

function computePositions(links, modulo, radius, origin={x:0,y:0}, rotation=(-Math.PI/2)) {
  return links.map(link => {
    const ang = (link.start / modulo) * Math.PI * 2 + rotation
    const ang2 = (link.end / modulo) * Math.PI * 2 + rotation
    return {
      ...link,
      pos: math.cartesian({ ang: ang, mag: radius }, origin),
      pos2: math.cartesian({ ang: ang2, mag: radius }, origin),
    }
  })
}
