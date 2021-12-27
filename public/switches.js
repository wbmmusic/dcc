const { sendAsyncSignal } = require("./messenger")

const sendData = (address, data, reverse) => {
    if (reverse) {
        if (data) sendAsyncSignal(address, 4, 0)
        else sendAsyncSignal(address, 3, 0)
    } else {
        if (data) sendAsyncSignal(address, 3, 0)
        else sendAsyncSignal(address, 4, 0)
    }

}

class Switch {
    constructor(swtch) {
        if (swtch) { Object.assign(this, { ...swtch }) }
        this.state = false
    }
    open = () => {
        this.state = true
        sendData(this.address, this.state, this.reverse)
        return this.state
    }
    close = () => {
        this.state = false
        sendData(this.address, this.state, this.reverse)
        return this.state
    }
    toggle = () => {
        console.log("Toggle Switch", this)
        this.state = !this.state
        sendData(this.address, this.state, this.reverse)
        return this.state
    }
}

exports.Switch = Switch