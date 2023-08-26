
// math
export const math = {
  cart: (a, r) => ({
    x: Math.cos(a) * r,
    y: Math.sin(a) * r
  }),
  dist: (pos1, pos2) => Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2),
  round(number, decimals=0) {
    const d = Math.pow(10, decimals) // digits after decimal
    return Math.round(number * d) / d
  },
  pad(number, zeroes=1) {
    const num = this.round(number, zeroes)
    const [int, dec=''] = num.toString().split('.')
    return `${int}.${dec.padEnd(zeroes, '0')}`
  }
}

// draw
export const draw = {
  text(ctx, pos, msg, { font='monospace', size=16, color='#000', colorOutline=null }) {
    ctx.save()
    ctx.font = `${size}px ${font}`
    ctx.fillStyle = color
    ctx.fillText(msg, pos.x, pos.y + size)
    if (colorOutline) { // untested
      ctx.fillStyle = colorOutline
      ctx.strokeText(msg, pos.x, pos.y + size)
    }
    ctx.restore()
  },
  line(ctx, pos1, pos2, { color='#000', color2=null, width=1 }) {
    ctx.save()
    ctx.beginPath()
    if (color2) {
      const gradient = ctx.createLinearGradient(pos1.x, pos1.y, pos2.x, pos2.y);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color2);
      ctx.strokeStyle = gradient;
    } else {
      ctx.strokeStyle = color
    }
    ctx.lineWidth = width
    ctx.moveTo(pos1.x, pos1.y)
    ctx.lineTo(pos2.x, pos2.y)
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  },
}

class Drawer {
  constructor(ctx) {
    this.CTX = ctx
  }
  clear() {
    this.CTX.clearRect(0, 0, this.CTX.canvas.width, this.CTX.canvas.height)
  }
  text({ pos, msg, font='monospace', size=16, color='#000', colorOutline=null }) {
    this._wrap(() => {
      this.CTX.font = `${size}px ${font}`
      this.CTX.fillStyle = color
      this.CTX.fillText(msg, pos.x, pos.y + size)
      if (colorOutline) { // untested
        this.CTX.fillStyle = colorOutline
        this.CTX.strokeText(msg, pos.x, pos.y + size)
      }
    })
  }
  pixel({ pos, color='#000' }) {
    this._wrap(() => {
      this.CTX.fillStyle = color
      this.CTX.fillRect(pos.x, pos.y, 1, 1)
    })
  }
  line({ pos, pos2, color='#000', color2=null, width=1 }) {
    this._wrap(() => {
      this.CTX.beginPath()
      if (color2) {
        const gradient = this.CTX.createLinearGradient(pos.x, pos.y, pos2.x, pos2.y);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color2);
        this.CTX.strokeStyle = gradient;
      } else {
        this.CTX.strokeStyle = color
      }
      this.CTX.lineWidth = width
      this.CTX.moveTo(pos.x, pos.y)
      this.CTX.lineTo(pos2.x, pos2.y)
      this.CTX.stroke()
      this.CTX.closePath()
    })
  }
  arrow({ pos, pos2, color='#000', width=1, label=null, headSize=5, headAngle=Math.PI/6, headLeft=true, headRight=true }) {
    this._wrap(() => {
      const ang = Util.angle(pos2, pos) // angle of vector
      const head = headSize * Math.sign(Util.distance(pos, pos2)) // length of arrow head
      this.CTX.beginPath()
      this.CTX.strokeStyle = color
      this.CTX.lineWidth = width
      this.CTX.moveTo(pos.x, pos.y)
      this.CTX.lineTo(pos2.x, pos2.y)
      if (headLeft) {
        this.CTX.lineTo(pos2.x - head * Math.cos(ang - headAngle), pos2.y - head * Math.sin(ang - headAngle))
      }
      this.CTX.moveTo(pos2.x, pos2.y)
      if (headRight) {
        this.CTX.lineTo(pos2.x - head * Math.cos(ang + headAngle), pos2.y - head * Math.sin(ang + headAngle))
      }
      this.CTX.stroke()
      if (label) this.text({ pos: { x: pos2.x, y: pos2.y + 5 }, msg: label, color })
    })
  }
  circle({ pos, r, color, width=1, fill=true }) {
    this._wrap(() => {
      this.CTX.beginPath()
      this.CTX.arc(pos.x, pos.y, r, 0, Math.PI * 2)
      if (fill) {
        this.CTX.fillStyle = color
        this.CTX.fill()
      } else {
        this.CTX.strokeStyle = color
        this.CTX.lineWidth = width
        this.CTX.stroke()
      }
      this.CTX.closePath()
    })
  }
  rectangle({ pos, pos2, color, fill=true }) {
    this._wrap(() => {
      this.CTX.beginPath()
      this.CTX.rect(pos.x, pos.y, pos2.x - pos.x, pos2.y - pos.y)
      if (fill) {
        this.CTX.fillStyle = color
        this.CTX.fill()
      } else {
        this.CTX.strokeStyle = color
        this.CTX.stroke()
      }
      this.CTX.closePath()
    })
  }
  rectangleCentered({ pos, w, h, color, fill=true }) {
    this._wrap(() => {
      let p1 = { x: pos.x - w / 2, y: pos.y - h / 2 }
      let p2 = { x: pos.x + w / 2, y: pos.y + h / 2 }
      this.rectangle({ pos: p1, pos2: p2, color, fill })
    })
  }
  window({ pos, pos2, color='#3C3' }) {
    this._wrap(() => {
      this.rectangle({ pos, pos2, color: '#8881' })
      this.rectangle({ pos, pos2, color, fill: false })
      const mid = Util.midpoint(pos, pos2)
      for (let p1 of [pos, mid, pos2]) {
        for (let p2 of [pos, mid, pos2]) {
          let p3 = { x: p1.x, y: p2.y }
          this.circle({ pos: p3, r: 20, color, fill: false })
          this.line({ pos: p3, pos2: mid, color, width: 1 })
        }
      }
    })
  }
  _wrap(func) {
    this.CTX.save()
    func()
    this.CTX.restore()
  }
}

// color
export const color = {
  hsv_to_rgb: ({ h, s, v }) => {
    let r, g, b, i, f, p, q, t
    i = Math.floor(h * 6)
    f = h * 6 - i
    p = v * (1 - s)
    q = v * (1 - f * s)
    t = v * (1 - (1 - f) * s)
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break
      case 1: r = q, g = v, b = p; break
      case 2: r = p, g = v, b = t; break
      case 3: r = p, g = q, b = v; break
      case 4: r = t, g = p, b = v; break
      case 5: r = v, g = p, b = q; break
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    }
  },
  str_rgba: ({ r, g, b, a }) => `rgba(${r}, ${g}, ${b}, ${a})`,
}