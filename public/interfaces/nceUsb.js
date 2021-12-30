const SerialPort = require('serialport')
const ByteLength = require('@serialport/parser-byte-length')

class NceUSB {
    constructor(device) {
        this.outBuffer = []
        this.sending = false
        if (device) { Object.assign(this, { ...device }) }

        this.port = new SerialPort(this.comPort, { baudRate: 9600 })
        this.port.on('error', (msg) => this.status(false))
        this.port.on('open', () => this.status(true))
    }
    closeSerialPort = () => this.port.close()
    info = () => { return { ...this } }
    sendNextInBuffer2 = async () => {
        const cmd = this.outBuffer.shift()
        switch (cmd.type) {
            case 'locoCtrlCmd':
                await this.sendLocoCtrlCmd(cmd.data)
                break;

            case 'asyncSignal':
                await this.sendAsyncSignal(cmd.data)
                break

            case 'opsProgramming':
                await this.sendOpsProgrammingMsg(cmd.data)
                break

            default:
                break;
        }
        if (this.outBuffer.length === 0) this.sending = false
        else this.sendNextInBuffer2()
    }
    sendMSG = (msg) => {
        console.log("Send Message", msg)
        this.outBuffer.push(msg)
        if (!this.sending) {
            this.sending = true
            this.sendNextInBuffer2()
        }
    }
    sendLocoCtrlCmd = async (command) => {
        console.log('sendLocoCtrlCmd')
        const parser = this.port.pipe(new ByteLength({ length: 1 }))

        return new Promise(async (resolve, reject) => {
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Sent Locomotive Control Command')
                else reject(new Error('Error in Locomotive Control Command'))
            })
            this.port.write([0xA2, ...command])
        })
    }
    sendAsyncSignal = async (command) => {
        console.log('sendAsyncSignal')
        const parser = this.port.pipe(new ByteLength({ length: 1 }))

        return new Promise(async (resolve, reject) => {
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Sent Locomotive Control Command')
                else reject(new Error('Error in Locomotive Control Command'))
            })
            this.port.write([0xAD, ...command])
        })
    }
    sendOpsProgrammingMsg = async (command) => {
        console.log('sendOpsProgrammingMsg')
        const parser = this.port.pipe(new ByteLength({ length: 1 }))

        return new Promise(async (resolve, reject) => {
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Sent Ops Programming msg')
                else reject(new Error('Error Send ops programming message'))
            })
            this.port.write([0xAE, ...command])
        })
    }
}

exports.NceUSB = NceUSB