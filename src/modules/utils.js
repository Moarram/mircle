
// math
export const math = {
  cart: (a, r) => ({
    x: Math.cos(a) * r,
    y: Math.sin(a) * r
  }),
  dist: (pos1, pos2) => Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2),
}

// draw
export const draw = {
  text: (ctx, pos, msg, { color='#000' }) => {
    ctx.fillStyle = color
    ctx.fillText(msg, pos.x, pos.y)
  },
  line: (ctx, pos1, pos2, { color='#000', width=1 }) => {
    ctx.beginPath()
    ctx.lineCap = 'round'
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.moveTo(pos1.x, pos1.y)
    ctx.lineTo(pos2.x, pos2.y)
    ctx.stroke()
    ctx.closePath()
  },
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