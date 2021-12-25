const { BrowserWindow, ipcMain } = require("electron")
const { join } = require('path')
const { format } = require('url')

class Locomotive {
    constructor(loco) {
        this.window = null
        this.throttle = { speed: 0, direction: 'stop' }
        if (loco) { Object.assign(this, { ...loco }) }
    }

    info = () => { return { ...this } }
    setName = (newName) => this.loco.name = newName
    showThrottle = () => {

        const windowArg = `--windowID:${this.loco._id}`
        console.log(windowArg)
        // Create the browser window.
        this.window = new BrowserWindow({
            width: 250,
            height: 500,
            icon: __dirname + '/icon.ico',
            autoHideMenuBar: true,
            show: false,
            //resizable: false,
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
                    return { ...this.throttle, ...this.loco }

                case 'setSpeed':
                    this.throttle.speed = data
                    console.log("Setting speed to", data)
                    return this.throttle.speed

                case 'setDirection':
                    this.throttle.direction = data
                    console.log("Setting Direction to", data)
                    return this.throttle.direction

                case 'eStop':
                    console.log("E-Stop this loco")
                    return "Got E-Stop"

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
    }
}

exports.Locomotive = Locomotive