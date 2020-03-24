
function addField(parent, label, value, step, handler) {
    let lbl = document.createElement('label')
    lbl.innerText = label
    let num = document.createElement('input')
    num.setAttribute('type', 'number')
    num.setAttribute('value', value)
    num.setAttribute('step', step)
    num.setAttribute('novalidate', "")
    num.addEventListener('change', handler)
    lbl.appendChild(num)
    parent.appendChild(lbl)
    return num
}
function addButton(parent, value, handler) {
    let btn = document.createElement('button')
    btn.innerText = value
    btn.addEventListener('click', handler)
    btn.className = ''
    parent.appendChild(btn)
    return btn
}
function addToggle(parent, label, checked, handler) {
    let lbl = document.createElement('label')
    lbl.innerText = label
    let chk = document.createElement('input')
    chk.setAttribute('type', 'checkbox')
    chk.checked = checked
    chk.addEventListener('change', handler)
    lbl.appendChild(chk)
    parent.appendChild(lbl)
    return chk
}

function buildActionMenu(parent) {
    const wrap = (value, handler) => {
        addButton(parent, value, event => {
            handler(event)
            refreshNumberMenu()
        })
    }
    wrap("Prev", () => circle.prev())
    wrap("Stop", event => {
        if (circle.toggle()) {
            event.target.innerText = "Stop"
            numberMenu['multiple'].disabled = true
        } else {
            event.target.innerText = "Start"
            numberMenu['multiple'].disabled = false
        }
    })
    wrap("Next", () => circle.next())
    wrap("Reverse", () => circle.reverse())
}

const numberMenu = {}
function buildNumberMenu(parent) {
    numberMenu['delta'] = addField(parent, "Delta", 0.1, 0.01, event => circle.setDelta(event.target.value))
    numberMenu['modulo'] = addField(parent, "Modulo", 100, 1, event => circle.setModulo(event.target.value))
    numberMenu['multiple'] = addField(parent, "Multiple", 2.0, 'any', event => circle.setMultiple(event.target.value))
    circle.onRedraw(() => {
        numberMenu['multiple'].value = circle.getMultiple()
    })
}
function refreshNumberMenu() {
    numberMenu['delta'].value = circle.getDelta()
    numberMenu['modulo'].value = circle.getModulo()
    numberMenu['multiple'].value = circle.getMultiple()
}

const drawerMenu = {}
function buildDrawerMenu(parent) {
    drawerMenu['res'] = addField(parent, "Resolution", window.devicePixelRatio||1, 0.1, event => circle.setRes(event.target.value))
    drawerMenu['width'] = addField(parent, "Line Width", 2, 'any', event => circle.setWidth(event.target.value))
    drawerMenu['color'] = addToggle(parent, "Hue", true, event => circle.setDoHue(event.target.checked))
    drawerMenu['fade'] = addToggle(parent, "Fade", false, event => circle.setDoFade(event.target.checked))
    // drawerMenu['label'] = addToggle(parent, "Label", false, event => circle.setDoLabels(event.target.checked))
}