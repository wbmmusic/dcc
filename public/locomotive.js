const { BrowserWindow, ipcMain } = require("electron")
const { join } = require('path')
const { format } = require('url')
const { setSpeedAndDir, sendEStop, setFunction } = require("./messenger")
const { config } = require("./utilities")

const makeFunctionState = (decoderID) => {
    let theDecoder = null
    for (let i = 0; i < config.decoders.length; i++) {
        if (decoderID === config.decoders[i]._id) {
            theDecoder = config.decoders.find(dcdr => dcdr._id === decoderID)
        }
    }

    let out = []
    for (let i = 0; i < 29; i++)out.push({ ...theDecoder.functions[i], state: false })
    return out

}

class Locomotive {
    constructor(loco) {
        this.window = null
        this.throttle = { speed: 0, direction: 'stop', functions: [...makeFunctionState(loco.loco.decoder)] }
        if (loco) { Object.assign(this, { ...loco }) }
    }
    info = () => { return { ...this } }
    setName = (newName) => this.loco.name = newName
    showThrottle = () => {
        if (this.window !== null) {
            this.window.focus()
            return
        }
        const windowArg = `--windowID:${this.loco._id}`
        // Create the browser window.
        this.window = new BrowserWindow({
            width: 300,
            height: 550,
            icon: __dirname + '/throttle.ico',
            autoHideMenuBar: true,
            show: false,
            title: this.loco.name + " " + this.loco.number,
            //resizable: false,
            alwaysOnTop: true,
            webPreferences: {
                preload: join(__dirname, 'preload.js'),
                additionalArguments: [windowArg]
            }
        })

        const startUrl = process.env.ELECTRON_START_URL + "#/modal/throttle" || format({
            pathname: join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true
        }) + '#/modal/throttle';
        this.window.loadURL(startUrl);

        ipcMain.handle(this.loco._id, (e, action, data) => {
            switch (action) {
                case 'getThrottle':
                    console.log('Got Throttle Data Request')
                    return { ...this.throttle, ...this.loco, dcdr: this.decoder }

                case 'setSpeed':
                    this.throttle.speed = data
                    console.log("Setting speed to", data)
                    setSpeedAndDir(this.loco.address, this.throttle.speed, this.throttle.direction)
                    return this.throttle.speed

                case 'setDirection':
                    this.throttle.direction = data
                    console.log("Setting Direction to", data)
                    setSpeedAndDir(this.loco.address, this.throttle.speed, this.throttle.direction)
                    return this.throttle.direction

                case 'setFunction':
                    console.log("Set Function", data)
                    this.throttle.functions[data].state = !this.throttle.functions[data].state
                    setFunction(this.loco.address, data, this.throttle.functions)
                    return this.throttle.functions

                case 'eStop':
                    console.log("E-Stop this loco")
                    this.throttle.speed = 0
                    sendEStop(this.loco.address, this.throttle.direction)
                    return 0

                case 'eStopAll':
                    console.log("E-Stop ALL")
                    return "Got E-Stop All"

                default:
                    return "Got your Message"
            }
        })

        // Emitted when the window is closed.
        this.window.on('closed', () => {
            ipcMain.removeHandler(this.loco._id)
            this.window = null
        })
        this.window.on("ready-to-show", () => {
            this.window.show()
        })
        this.window.on('moved', () => console.log(this.window.getPosition()))
    }
    closeThrottle = () => {
        if (this.window === null) return
        this.window.close()
    }
}

exports.Locomotive = Locomotive