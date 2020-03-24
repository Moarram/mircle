
class Circle {
    constructor() {
        this.run = false
        this.modulo = 100
        this.multiple = 1.0
        this.delta = 0.1 // delta: change to multiple per sec
    }
    init(canvas) {
        this.CANVAS = canvas
        this.CTX = canvas.getContext('2d')
        this.ratio = window.devicePixelRatio || 1
        this.lineWidth = 2
        this.doHue = true
        this.doFade = false
        this.doLabels = false
    }
    onRedraw(handler) {
        this.redrawHandler = handler
    }

    setDelta(delta) {
        this.delta = parseFloat(delta)
    }
    setMultiple(multiple) {
        this.multiple = parseFloat(multiple)
        this.redraw()
    }
    setModulo(modulo) {
        this.modulo = parseFloat(modulo)
        this.redraw()
    }
    getDelta() {
        return this.delta
    }
    getMultiple() {
        return Math.round(this.multiple*1000)/1000
    }
    getModulo() {
        return this.modulo
    }
    
    start() {
        this.run = true
        this.lastFrame = Date.now()
        this.loop()
        return 1
    }
    stop() {
        this.run = false
        return 0
    }
    toggle() {
        return this.run ? this.stop() : this.start()
    }
    prev() {
        if (this.delta > 0) this.multiple -= 0.999
        this.multiple = Math.floor(this.multiple - 0.00001)
        this.redraw()
    }
    next() {
        if (this.delta < 0) this.multiple += 0.999
        this.multiple = Math.ceil(this.multiple + 0.00001)
        this.redraw()
    }
    reverse() {
        return this.delta = -this.delta
    }

    loop() {
        if (!this.run) return

        const now = Date.now()
        this.multiple += this.delta*(now - this.lastFrame)/1000
        this.lastFrame = now

        this.redraw()

        return window.requestAnimationFrame(this.loop.bind(this))
    }

    setRes(ratio) {
        this.ratio = ratio
        this.resize()
        this.redraw()
    }
    setWidth(width) {
        this.lineWidth = parseFloat(width)
        this.redraw()
    }
    setDoHue(bool) {
        this.doHue = bool
        this.redraw()
    }
    setDoFade(bool) {
        this.doFade = bool
        this.redraw()
    }
    setDoLabels(bool) {
        this.doLabels = bool
        this.redraw()
    }

    resize() {
        this.CANVAS.width = this.CANVAS.clientWidth*this.ratio
        this.CANVAS.height = this.CANVAS.clientHeight*this.ratio
    }
    redraw() {
        if (!this.CTX) return
        if (this.redrawHandler) this.redrawHandler()
        this.CTX.clearRect(0, 0, this.CANVAS.width, this.CANVAS.height)
        this.draw()
    }
    draw() {
        if (!this.CTX) return
        const text = (p, msg, color='#FFF') => {
            this.CTX.fillStyle = color
            this.CTX.fillText(msg, p[0], p[1])
        }
        const line = (p1, p2, color, width=1) => {
            this.CTX.beginPath()
            this.CTX.strokeStyle = color
            this.CTX.lineWidth = width
            this.CTX.moveTo(p1[0], p1[1])
            this.CTX.lineTo(p2[0], p2[1])
            this.CTX.stroke()
            this.CTX.closePath()
        }
        const rgb = (h, s, v) => {
            let r, g, b, i, f, p, q, t
            i = Math.floor(h*6)
            f = h*6-i
            p = v*(1-s)
            q = v*(1-f*s)
            t = v*(1-(1-f)*s)
            switch (i%6) {
                case 0: r=v, g=t, b=p; break
                case 1: r=q, g=v, b=p; break
                case 2: r=p, g=v, b=t; break
                case 3: r=p, g=q, b=v; break
                case 4: r=t, g=p, b=v; break
                case 5: r=v, g=p, b=q; break
            }
            return [Math.round(r*255), Math.round(g*255), Math.round(b*255)]
        }
        const rgba = (rgb, a) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`
        const cart = (a, r) => [Math.cos(a)*r, Math.sin(a)*r]
        const dist = (p1, p2) => Math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

        const lines = []
        const r = this.CANVAS.width/2
        const r2 = r*0.9 // effective radius
        for (let i=0; i<this.modulo+1; i++) {
            const a1 = i/this.modulo*Math.PI*2
            const a2 = (a1*this.multiple/2)%Math.PI*2
            const p1 = cart(a1, r2)
            const p2 = cart(a2, r2)
            lines.push([[p1[0]+r, p1[1]+r], [p2[0]+r, p2[1]+r], dist(p1, p2)])
        }
        
        lines.sort((a, b) => b[2] - a[2])

        let colorRGB
        let alpha = 1
        for (let l of lines) {
            if (this.doFade) alpha = 1 - (l[2])/(r2*2)
            if (this.doHue) {
                colorRGB = rgb((l[2]/(r2*2.35))**2, 1, 1)
            } else {
                colorRGB = [230, 230, 230]
            }
            line(l[0], l[1], rgba(colorRGB, alpha), this.lineWidth)
        }

        if (this.doLabels) text([10, 20], `${Math.round(this.multiple*1000)/1000} / ${this.modulo}`)
    }
}