import util from '@moarram/util'

// TODO opacity + thickness based roughly on number of lines
// TODO figure out how to map weighted factors to style (color, thickness, opacity)
// TODO better function arrangement (compute, style, prepare, draw, image)
// TODO output image at last step
// TODO progress reporting
// TODO better names than "link" and "occurences"?
// TODO define types (as comments)
// TODO add style before or after computing positions (for distance? color budget?)
// TODO color based on common multiples, unique color for each number

/**
 * Definitions
 * 
 * mircle - drawn circle multiples for specific multiple & modulo combination
 * mircle family - drawn circle multiples for all multiples within modulo
 */

/**
 * Pipeline
 * 
 * init canvas - make square, set size, set origin, layer for each group?
 *  returns CanvasRenderingContext2D
 * 
 * compute links - use multiple & modulo
 *  returns [{ start, end }, ...]
 * 
 * group links - count occurrences of each start & end combination
 *  returns [{ start, end, occurrences }, ...]
 *  TODO investigate grouping properties... count(a->b) ?= count(b->a)
 * 
 * sort links - in place, by occurrences, start, etc.
 * 
 * add style - might become more steps later
 *  returns [{ color, thickness, ... }]
 * 
 * add positions - use start & end to compute pos & pos2
 *  returns [{ pos, pos2, ... }, ...]
 * 
 * draw - interuptable, batched, target frametime, etc.
 *  returns { progress, abort() }
 */

/**
 * Draws all circle multiples of the specified modulo to the canvas
 * 
 * @param {HTMLCanvasElement} canvas - destination canvas
 * @param {number} modulo - number of points around the circle
 * (optional params omitted...)
 * @param {Function} onProgress - called with progress message
 * 
 * @returns {Function} - abort callback
 */
export function createMircleFamily({ canvas, modulo, size=500, targetFrameMs=100, padding=10, onProgress=null }) {
  console.info(`${modulo} = ${primeFactors(modulo).join(' x ')}`)

  function progress(msg) {
    console.log(msg)
    onProgress(msg)
  }

  // Compute links
  progress('Computing...')
  const allLinks = []
  for (let multiple = 0; multiple < modulo; multiple++) {
    allLinks.push(...computeLinks(modulo, multiple))
  }

  // Group links
  const groupedLinks = groupLinks(allLinks, modulo)
  // const groupedLinks = computeLinks(modulo, 5)

  // Sort links
  groupedLinks.sort((a, b) => a.start - b.start)
  groupedLinks.sort((a, b) => a.occurrences - b.occurrences)

  // Add style
  addStyle(groupedLinks, modulo)

  // Add positions
  const radius = (size - padding * 2) / 2
  addPositions(groupedLinks, modulo, radius)

  // Initialize canvas
  progress('Initializing...')
  const ctx = initCanvas(canvas, size)
  
  // Draw
  progress('Drawing...')
  return drawLines(ctx, groupedLinks, targetFrameMs, progress)

  progress('Done.')
}

function initCanvas(canvas, size) {
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { alpha: false })
  ctx.translate(size / 2, size / 2)
  return ctx
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

      case 1:
        color = { r: 0, g: 150, b: 255, a: .1 }
        break

      default:
        color = {
          r: 255 - (link.start / modulo) * 255,
          g: (1 - percentOfMax(link.occurrences)) * 200 + 55,
          b: (1 - percentOfList(link.occurrences)) * 200 + 55,
          a: .1 + percentOfList(link.occurrences) * .8,
        }
        thickness = 1 + percentOfMax(link.occurrences) * 9
    }
    link.color = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
    link.thickness = thickness
  })
}

function addPositions(links, modulo, radius, origin={x:0,y:0}, rotation=(-Math.PI/2)) {
  links.forEach(link => {
    const ang = (link.start / modulo) * Math.PI * 2 + rotation
    const ang2 = (link.end / modulo) * Math.PI * 2 + rotation
    link.pos = util.math.cartesian({ ang: ang, mag: radius }, origin)
    link.pos2 = util.math.cartesian({ ang: ang2, mag: radius }, origin)
  })
}

function drawLines(ctx, lines, targetFrameMs, onProgress=null) {
  let index = 0
  let stop = false
  let batchSize = 100 // initial value

  const ctxLines = lines.map(line => ({ ctx, ...line }))

  ctx.globalCompositeOperation = 'lighter'
  ctx.imageSmoothingEnabled = false

  function drawBatch() {
    const batchLines = ctxLines.slice(index, index + batchSize)
    index += batchLines.length

    window.requestAnimationFrame(() => {
      if (stop) return
    
      const startTimestamp = Date.now()
      batchLines.forEach(line => util.draw.line(line))
      const duration = Date.now() - startTimestamp

      const correction = Math.max(Math.min(targetFrameMs / duration, 2), 0.5)
      batchSize = Math.max(Math.floor(batchSize * correction), 1)

      const decimals = 0
      const progress = Math.floor((index / lines.length) * 100)
      onProgress(`(${progress}%) ${batchLines.length} lines in ${duration} ms`)

      return (index < lines.length) ? drawBatch() : console.log('Done!')
    })
  }
  drawBatch()
  return () => stop = true
}

// =============================================================================


export function createMircle(canvas, modulo) {
  console.log(`Modulo: ${modulo}`)
  console.log(`Prime factors: ${primeFactors(modulo)}`)
  const size = 10000
  const padding = size / 100

  console.debug('Computing...')
  const ctx = initCanvas(canvas, size)
  const links = joinLinks(computeLinksFamily(modulo))
  const lines = computeLines(links, modulo, size / 2 - padding)
  const colors = computeColors(lines)
  lines.forEach(line => line.color = colors[line.val])
  lines.sort((a, b) => a.val - b.val)
  // const grouped = groupLines(lines)
  // const maxCount = Object.keys(grouped).reduce((max, key) => Math.max(max, key), 0)
  // console.debug(lines)
  console.debug('Rendering...')
  const step = 200
  let index = 0
  function draw() {
    window.requestAnimationFrame(() => {
      drawLines(ctx, lines.slice(index, Math.min(index + step, lines.length)))
      index += step
      return (index < lines.length) ? draw() : console.debug('Done!')
    })
  }
  draw()
}

// export function computeLinks(modulo, multiple) {
//   const links = {}
//   for (let a = 1; a < modulo + 1; a++) {
//     const b = (a * multiple) % modulo
//     links[`${a}->${b}`] = 1
//   }
//   return links
// }

export function computeLinksFamily(modulo) {
  const links = {}
  for (let multiple = 0; multiple < modulo; multiple++) {
    Object.entries(computeLinks(modulo, multiple)).forEach(([key, val]) => {
      if (key in links) {
        links[key] += val
      } else {
        links[key] = val
      }
    })
  }
  return links
}

export function joinLinks(links) {
  const joined = {}
  Object.entries(links).forEach(([key, val]) => {
    const [a, b] = key.split('->')
    const joinKey = `${Math.min(a, b)}->${Math.max(a, b)}`
    if (joinKey in joined) {
      joined[joinKey] += val
    } else {
      joined[joinKey] = val
    }
  })
  return joined
}

export function computeLines(links, modulo, radius, origin={x:0,y:0}) {
  const rotation = -Math.PI / 2
  return Object.entries(links).map(([key, val]) => {
    const [a, b] = key.split('->')
    const ang = (a / modulo) * Math.PI * 2 + rotation
    const ang2 = (b / modulo) * Math.PI * 2 + rotation
    const pos = util.math.cartesian({ ang: ang, mag: radius }, origin)
    const pos2 = util.math.cartesian({ ang: ang2, mag: radius }, origin)
    return { pos, pos2, val }
  })
}

export function computeColors(lines) {
  const valCounts = {}
  lines.forEach(line => {
    if (line.val in valCounts) {
      valCounts[line.val] += 1
    } else {
      valCounts[line.val] = 1
    }
  })
  const vals = Object.keys(valCounts).sort((a, b) => a - b)
  const counts = Object.values(valCounts).sort((a, b) => a - b)
  const largestVal = Math.max(...vals)
  const largestCount = Math.max(...counts)

  const colors = {}
  Object.entries(valCounts).forEach(([val, count]) => {
    const percentValDiscrete = (vals.indexOf(val) + 1) / vals.length
    const percentCountDiscrete = (counts.indexOf(count) + 1) / counts.length
    const percentVal =  val / largestVal
    const percentCount = count / largestCount
    const r = (1 - percentCount * percentVal) * 255
    const g = (1 - percentCountDiscrete) * 255
    const b = percentCount * 255
    const a = (percentValDiscrete + .02) * .9
    colors[val] = `rgba(${r}, ${g}, ${b}, ${a})`
  })
  return colors
}

// export function drawLines(ctx, lines) {
//   lines.forEach(({ pos, pos2, color, val }) => {
//     // const color = '#FFF1'
//     const thickness = Math.min(1 + val * .01, 3) // TODO compute elsewhere
//     util.draw.line({ ctx, pos, pos2, color, thickness })
//   })
// }

function primeFactors(n) {
  const factors = [];
  let divisor = 2;
  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  return factors;
}

// export function groupLines(lines) {
//   const grouped = {}
//   lines.forEach(line => {
//     if (line.count in grouped) {
//       grouped[line.count].push(line)
//     } else {
//       grouped[line.count] = [line]
//     }
//   })
//   return grouped
// }

// =============================================================================


export function drawMircle(ctx, mod, mult, color) {
  const width = ctx.canvas.width
  const height = ctx.canvas.height
  const origin = { x: width / 2, y: height / 2 }
  const radius = Math.min(width, height) / 2 - 10
  const rotation = -Math.PI / 2
  // const radius = 32767 / 2 - 100

  // util.draw.circle({ ctx, pos: origin, r: radius, color: '#FFF1', fill: false })

  for (let i = 1; i < mod + 1; i++) {
    const ang1 = (i / mod) * Math.PI * 2
    const ang2 = (ang1 * mult) % (Math.PI * 2)
    const pos1 = util.math.cartesian({ ang: ang1 + rotation, mag: radius }, origin)
    const pos2 = util.math.cartesian({ ang: ang2 + rotation, mag: radius }, origin)
    // if (util.math.distance(pos1, pos2) > radius * 2 - .00001) continue
    util.draw.line({ ctx, pos: pos1, pos2, color, thickness: .5 })
  }
}

export function drawMircleFamily(ctx, mod) {
  let mult = 0
  function drawNext() {
    window.requestAnimationFrame(() => {
      console.debug(`FRAME ${mult}/${mod}`)
      const color = '#FFFFFF44'
      drawMircle(ctx, mod, mult, color)
      if (mult++ < mod) {
        drawNext()
      }
    })
  }
  drawNext()
}