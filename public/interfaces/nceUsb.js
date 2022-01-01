const SerialPort = require('serialport')
const ByteLength = require('@serialport/parser-byte-length')
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout')

class NceUSB {
    constructor(device) {
        this.outBuffer = []
        this.sending = false
        this.programmingTrackEnabled = false
        if (device) { Object.assign(this, { ...device }) }

        this.port = new SerialPort(this.comPort, { baudRate: 9600 })
        this.port.on('error', (msg) => this.status(false))
        this.port.on('open', async () => {
            this.status(true)
            await this.#disableProgrammingTrack()
            console.log("USB Software Ver", await this.#getSoftwareVersion())
        })
    }
    closeSerialPort = () => this.port.close()
    info = () => { return { ...this } }
    sendNextInBuffer2 = async () => {
        const cmd = this.outBuffer.shift()
        switch (cmd.type) {
            case 'locoCtrlCmd':
                await this.#sendLocoCtrlCmd(cmd.data)
                break;

            case 'asyncSignal':
                await this.#sendAsyncSignal(cmd.data)
                break

            case 'opsProgramming':
                await this.#sendOpsProgrammingMsg(cmd.data)
                break

            case 'enableProgrammingTrack':
                try {
                    const trackStateEn = await this.#enableProgrammingTrack()
                    console.log("Track State is", trackStateEn)
                    cmd.callback(this.programmingTrackEnabled)
                } catch (error) {
                    console.log(error)
                }
                break

            case 'disableProgrammingTrack':
                try {
                    const trackState = await this.#disableProgrammingTrack()
                    console.log("Track State is", trackState)
                    cmd.callback(this.programmingTrackEnabled)
                } catch (error) {
                    console.log(error)
                }
                break

            case 'readCvPrg':
                try {
                    const cvVal = await this.#readCvPrg(cmd.data)
                    console.log("CV val =", cvVal)
                    cmd.callback(cvVal)
                } catch (error) {
                    console.log(error)
                }
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
    #sendLocoCtrlCmd = async (command) => {
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
    #sendAsyncSignal = async (command) => {
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
    #sendOpsProgrammingMsg = async (command) => {
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

    // PROGRAMMING TRACK RELATED
    #enableProgrammingTrack = async (command) => {
        console.log('Enable Programming Track')
        const parser = this.port.pipe(new ByteLength({ length: 1 }))

        return new Promise(async (resolve, reject) => {
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') {
                    this.programmingTrackEnabled = true
                    resolve('Enabled programming track')
                }
                else if (res === '3') reject('Short Circuit on programming track')
                else reject(new Error('Error Enabling programming track'))
            })
            this.port.write([0x9E])
        })
    }
    #disableProgrammingTrack = async (command) => {
        console.log('Disable Programming Track')
        const parser = this.port.pipe(new ByteLength({ length: 1 }))

        return new Promise(async (resolve, reject) => {
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') {
                    this.programmingTrackEnabled = false
                    resolve('Programming Track Disabled')
                }
                else reject(new Error('Error disabling programming track'))
            })
            this.port.write([0x9F])
        })
    }
    #programCvInPagedMode = async (command) => {
        console.log('programCvInPagedMode')
        const parser = this.port.pipe(new ByteLength({ length: 1 }))

        return new Promise(async (resolve, reject) => {
            if (command.length !== 3) reject(new Error('programCvInPagedMode expects 3 command bytes'))
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Programmed CV in paged mode')
                else if (res === '0') reject('Programming Track Not Enabled')
                else reject(new Error('Error Programming CV in paged mode'))
            })
            this.port.write([0xA0, ...command])
        })
    }
    #programRegister = async (command) => {
        console.log('programRegister')
        const parser = this.port.pipe(new ByteLength({ length: 1 }))

        return new Promise(async (resolve, reject) => {
            if (command.length !== 2) reject(new Error('programRegister expects 2 command bytes'))
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Programmed CV in paged mode')
                else if (res === '0') reject('Programming Track Not Enabled')
                else reject(new Error('Error Programming CV in paged mode'))
            })
            this.port.write([0xA6, ...command])
        })
    }
    #readRegister = async (command) => {
        console.log('readRegister')
        const parser = this.port.pipe(new InterByteTimeout({ interval: 500 }))

        return new Promise(async (resolve, reject) => {
            if (command.length !== 1) reject(new Error('readRegister expects 1 command byte'))
            parser.once('data', (data) => {
                this.port.unpipe(parser)
                if (data.length === 0) reject(new Error('Error reading Register'))
                if (data[0].toString() === '0') reject('Programming Track Not Enabled')
                if (data.length > 1) {
                    if (data[1].toString() === '3') reject('Cant read register')
                    else if (data[1].toString() === '!') resolve(data[0])
                }
                reject(new Error('Error reading Register'))
            })
            this.port.write([0xA7, ...command])
        })
    }
    #programCV = async (command) => {
        console.log('programCV')
        const parser = this.port.pipe(new ByteLength({ length: 1 }))

        return new Promise(async (resolve, reject) => {
            if (command.length !== 3) reject(new Error('programCV expects 3 command bytes'))
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Programmed CV')
                else if (res === '0') reject('Programming Track Not Enabled')
                else reject(new Error('Error Programming CV'))
            })
            this.port.write([0xA8, ...command])
        })
    }
    #readCvPrg = async (command) => {
        console.log('readCV')
        const parser = this.port.pipe(new InterByteTimeout({ interval: 20 }))

        return new Promise(async (resolve, reject) => {
            if (command.length !== 2) reject(new Error('readCV expects 2 command bytes'))
            parser.once('data', (data) => {
                this.port.unpipe(parser)
                if (data.length === 0) reject(new Error('Error reading CV data length'))
                else if (data[0].toString() === '0') reject('Programming Track Not Enabled')
                else if (data.length > 1) {
                    if (data.toString()[1] === '3') reject('Cant read CV')
                    else if (data.toString()[1] === '!') resolve(data[0])
                    else reject(new Error('Error reading CV'))
                } else reject(new Error('Error reading CV'))
            })
            this.port.write([0xA9, ...command])
        })
    }

    // ADMIN
    #getSoftwareVersion = async () => {
        console.log('programCvInPagedMode')
        const parser = this.port.pipe(new ByteLength({ length: 3 }))

        return new Promise(async (resolve, reject) => {
            parser.once('data', (data) => {
                this.port.unpipe(parser)
                resolve(data)
            })
            this.port.write([0xAA])
        })
    }
}

exports.NceUSB = NceUSB