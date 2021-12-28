const { setFunction } = require("./messenger")

const makeFunctionStates = (actions) => {
    let out = []
    for (let i = 0; i < 29; i++) {
        if (i < actions.length) out.push(actions[i])
        else out.push({ name: '', state: false })
    }
    return out
}

class Accessory {
    constructor(acc) {
        if (acc) { Object.assign(this, { ...acc }) }
    }
    info = () => { return { ...this } }
    toggleFunction = (address, functionNumber) => {
        this.device.actions[functionNumber].state = !this.device.actions[functionNumber].state
        setFunction(address, functionNumber, makeFunctionStates(this.device.actions))
        return this.device.actions[functionNumber].state
    }
}

exports.Accessory = Accessory