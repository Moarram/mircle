import * as U from './utils.js'

export default class MCircle {
  constructor(ctx, mod=300, mult=2, delta=0.1, opts={}, autodraw=true) {
    this.CTX = ctx
    this._mod = mod    // modulo (number of lines)
    this._mult = mult  // multiple (determines second point of line)
    this._delt = delta // change to mult each second
    this._opts = opts  // drawing options
    this.autodraw = autodraw // draw on change

    this._run = false
    this._mspf = 16
    this.fps = 60
  }

  start() {
    if (this._run) return
    this._run = true
    this.lastFrame = Date.now()
    this.lastTest = Date.now() // debug
    this.loop()
  }
  stop() {
    this._run = false
  }
  loop() {
    if (!this._run) return
    const now = Date.now()
    this._mult += this._delt*(now - this.lastFrame)/1000
    this.lastFrame = now

    // (this._mspf*(divisor - 1) + next)/divisor

    this.redraw()
    return window.requestAnimationFrame(this.loop.bind(this))
  }

  redraw() {
    if (this._opts.trail > 0) {
      this.CTX.fillStyle = `rgba(0, 0, 0, ${(1 - this._opts.trail)**2}`
      this.CTX.fillRect(0, 0, this.CTX.canvas.width, this.CTX.canvas.height) // fade canvas
    } else {
      this.CTX.clearRect(0, 0, this.CTX.canvas.width, this.CTX.canvas.height) // clear canvas
    }
    this.draw()
  }
  draw() {
    drawMCircle(this.CTX, this._mod, this._mult, this._opts)
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

export function drawMCircle(ctx, mod, mult, opts) {
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
  const r = Math.min(w, h)*0.45
  
  for (let i=1; i<mod+1; i++) {
    const a1 = i/mod*Math.PI*2
    const a2 = (a1*mult/2)%Math.PI*2
    const s1 = U.math.cart(a1, r)
    const s2 = U.math.cart(a2, r)
    const p1 = [s1[0]+w/2, s1[1]+h/2]
    const p2 = [s2[0]+w/2, s2[1]+h/2]
    lines.push({i, p1, p2, dist:U.math.dist(p1, p2)})
  }
  
  switch (opts.drawOrder) {
    case 'short': lines.sort((a, b) => b.dist - a.dist); break
    case 'long': lines.sort((a, b) => a.dist - b.dist); break
    case 'fast': break
    case 'slow': lines.reverse(); break
    default: lines.sort((a, b) => b.dist - a.dist); // short
  }

  for (let l of lines) {
    let hue = null
    switch (opts.colorMode) {
      case 'short': hue = (l.dist/(r*2.35))**2; break
      case 'long': hue = Math.sqrt((r*2 - l.dist)/(r*2.35)); break
      // case 'fast': hue = ((mod - l.i)/(mod*1.2))**1.2; break
      case 'fast': hue = (mod - l.i)/mod; break
      // case 'slow': hue = (l.i)/(mod*1.3); break
      case 'slow': hue = l.i/mod; break
      default: hue = null
    }
    let colorRGB = (hue === null) ? [255, 255, 255] : U.color.rgb(hue, 1, 1)
    
    let alpha = opts.lineAlpha
    switch (opts.alphaMode) {
      case 'short': alpha *= 1 - l.dist/(r*2); break
      case 'long': alpha *= (l.dist/(r*2))**3; break
      case 'fast': alpha *= (l.i/(mod*1.2))**1.5; break
      case 'slow': alpha *= ((mod - l.i)/(mod*1.2))**1.5; break
      default: alpha = 1
    }
    let colorRGBA = U.color.rgba(colorRGB, alpha)

    U.draw.line(ctx, l.p1, l.p2, colorRGBA, opts.lineWidth||1)
  }

  if (opts.doLabels) text([10, 20], `${Math.round(mult*1000)/1000} / ${mod}`)
}