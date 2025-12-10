import { sendAsyncSignal } from './messenger.js';

const sendData = (address: number, data: boolean, reverse: boolean) => {
    if (reverse) {
        if (data) sendAsyncSignal(address, 4, 0)
        else sendAsyncSignal(address, 3, 0)
    } else {
        if (data) sendAsyncSignal(address, 3, 0)
        else sendAsyncSignal(address, 4, 0)
    }

}

export class Switch {
    state: boolean;
    address: number;
    reverse: boolean;
    _id: string;
    name: string;

    constructor(swtch: any) {
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

