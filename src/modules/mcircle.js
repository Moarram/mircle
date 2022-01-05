import * as U from '@/modules/utils.js'

export default class MCircle {
  constructor(ctx, mod=1000, mult=720, delta=0.05, opts={}, autodraw=true) {
    this.ctx = ctx
    this._mod = mod    // modulo (number of lines)
    this._mult = mult  // multiple (determines second point of line)
    this._delt = delta // change to mult each second
    this._opts = opts  // drawing options
    this.autodraw = autodraw // draw on change

    this._run = false
    this._frame = 0
    this._mspf = 16

    this._onFrameCallback = null
  }

  onFrame(func=null) {
    this._onFrameCallback = func
  }

  start() {
    this._run = true
    this._frame = 0
    this._lastFrame = Date.now()
    this._loop()
  }
  stop() {
    this._run = false
  }
  _loop() {
    if (!this._run) return
    
    const now = Date.now()
    const ms = now - this._lastFrame
    
    this._lastFrame = now
    this._mult += this._delt * (ms / 1000)
    // this._mult += this._delt * (17 / 1000)
    this._mspf = (this._mspf * (10 - 1) + ms) / 10
    this._frame += 1

    this.redraw()

    if (this._onFrameCallback) this._onFrameCallback(this._frame)
    return window.requestAnimationFrame(this._loop.bind(this))
  }

  redraw() {
    if (this._opts.trail > 0) {
      this.ctx.fillStyle = `rgba(0, 0, 0, ${(1 - this._opts.trail) ** 2}`
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height) // fade canvas
    } else {
      this.ctx.fillStyle = '#000'
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height) // clear canvas
    }
    this.draw()
  }
  draw() {
    drawMCircle(this.ctx, this._mod, this._mult, this._opts)
  }

  get fps() {
    return (this._run) ? Math.round(1 / (this._mspf / 1000)) : 0
  }

  set mod(num) {
    if (num < 1) num = 1
    this._mod = Math.floor(num)
    if (this.autodraw) this.redraw()
  }
  get mod() {
    return this._mod
  }

  set mult(num) {
    this._mult = num
    if (this.autodraw) this.redraw()
  }
  get mult() {
    return this._mult
  }

  set delta(num) {
    this._delt = num
  }
  get delta() {
    return this._delt
  }

  set opts(obj) {
    for (let key in obj) this._opts[key] = obj[key]
    if (this.autodraw) this.redraw()
  }
  get opts() {
    const ret = {}
    for (let key in this._opts) ret[key] = this._opts[key]
    return ret
  }

  set run(bool) {
    (bool) ? this.start() : this.stop()
  }
  get run() {
    return this._run
  }
}

function drawMCircleSimple(ctx, mod, mult) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  const r = Math.min(w, h) * .45
  
  ctx.beginPath()
  ctx.strokeStyle = '#FFF'
  ctx.lineWidth = 1
  for (let i = 1; i < mod + 1; i++) {
    const a1 = (i / mod) * Math.PI * 2
    const a2 = (a1 * mult) % (Math.PI * 2)
    ctx.moveTo(Math.cos(a1) * r + w / 2, Math.sin(a1) * r + h / 2)
    ctx.lineTo(Math.cos(a2) * r + w / 2, Math.sin(a2) * r + h / 2)
  }
  ctx.stroke()
  ctx.closePath()
}

export function drawMCircle(ctx, mod, mult, opts) {
  // return drawMCircleSimple(ctx, mod, mult)

  // opts:
  //  lineWidth (num (0,inf)): width of lines
  //  lineAlpha (num (0,1]): base transparency of lines (1 is solid)
  //  drawOrder (str): which lines are drawn on top
  //    'short'
  //    'long'
  //    'fast'
  //    'slow'
  //  colorMode (str): most colorful line type (null for only white)
  //    'short'
  //    'long'
  //    'fast'
  //    'slow'
  //  alphaMode (str): most solid line type (null for all solid)
  //    'short'
  //    'long'
  //    'fast'
  //    'slow'

  const w = ctx.canvas.width
  const h = ctx.canvas.height

  const lines = []
  const r = Math.min(w, h) * .45
  
  for (let i = 1; i < mod + 1; i++) {
    const a1 = (i / mod) * Math.PI * 2
    const a2 = (a1 * mult) % (Math.PI * 2)
    const s1 = U.math.cart(a1, r)
    const s2 = U.math.cart(a2, r)
    const pos1 = { x: s1.x + w / 2, y: s1.y + h / 2 }
    const pos2 = { x: s2.x + w / 2, y: s2.y + h / 2 }
    lines.push({ i, pos1, pos2, dist: U.math.dist(pos1, pos2) })
  }
  
  switch (opts.drawOrder) {
    case 'short': lines.sort((a, b) => b.dist - a.dist); break
    case 'long': lines.sort((a, b) => a.dist - b.dist); break
    case 'fast': break
    case 'slow': lines.reverse(); break
    default: lines.sort((a, b) => b.dist - a.dist); // short
  }

  ctx.save()
  ctx.lineWidth = opts.lineWidth || 1

  for (let l of lines) {
    let hue = null
    switch (opts.colorMode) {
      case 'short': hue = (l.dist / (r * 2.35)) ** 2; break
      case 'long': hue = Math.sqrt((r * 2 - l.dist) / (r * 2.35)); break
      // case 'fast': hue = ((mod - l.i)/(mod*1.2)) ** 1.2; break
      case 'fast': hue = (mod - l.i) / mod; break
      // case 'slow': hue = (l.i)/(mod*1.3); break
      case 'slow': hue = l.i / mod; break
      default: hue = null
    }
    let rgb = (hue === null) ? { r: 255, g: 255, b: 255 } : U.color.hsv_to_rgb({ h: hue, s: 1, v: 1 })
    
    let alpha = opts.lineAlpha || 1
    switch (opts.alphaMode) {
      case 'short': alpha *= 1 - l.dist / (r * 2); break
      case 'long': alpha *= (l.dist / (r * 2)) ** 3; break
      case 'fast': alpha *= (l.i / (mod * 1.2)) ** 1.5; break
      case 'slow': alpha *= ((mod - l.i) / (mod * 1.2)) ** 1.5; break
    }
    // let colorRGBA = U.color.str_rgba({ ...colorRGB, a: alpha })

    ctx.beginPath()
    ctx.strokeStyle = (alpha === 1) ? `rgb(${rgb.r},${rgb.g},${rgb.b})` : `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
    ctx.moveTo(l.pos1.x, l.pos1.y)
    ctx.lineTo(l.pos2.x, l.pos2.y)
    ctx.stroke()
    
    // U.draw.line(ctx, l.pos1, l.pos2, { color: colorRGBA, width: opts.lineWidth||1 })

  }

  ctx.closePath()
  ctx.restore()

  if (opts.doLabels) text({ x: 10, y: 20 }, `${Math.round(mult * 1000) / 1000} / ${mod}`)
}