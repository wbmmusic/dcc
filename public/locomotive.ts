/**
 * Locomotive Control Class
 * 
 * Manages individual locomotive instances with DCC command processing,
 * throttle window management, and real-time status tracking.
 */

import { BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { setSpeedAndDir, sendEStop, setFunction } from './messenger.js';
import { config } from './utilities.js';
import type { Config, Decoder } from './types.js';

// Vite build configuration
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

/**
 * Creates initial function state array for a locomotive's decoder
 * 
 * Initializes all 29 DCC function buttons (F0-F28) with their configured
 * names and actions, but sets all states to false (off).
 * 
 * @param {string} decoderID - ID of the decoder to get function definitions from
 * @returns {Array} Array of function objects with name, action, and state properties
 */
const makeFunctionState = (decoderID: string) => {
    // Find the decoder configuration for this locomotive
    const theDecoder = config.decoders.find(dcdr => dcdr._id === decoderID)
    if (!theDecoder) {
        throw new Error(`Decoder ${decoderID} not found`)
    }

    // Create function state array (F0-F28 = 29 functions)
    let out = []
    for (let i = 0; i < 29; i++) {
        out.push({ ...theDecoder.functions[i], state: false })
    }
    return out
}

/**
 * Locomotive Control Class
 * 
 * Manages a single locomotive's DCC operations including speed, direction,
 * function control, and throttle window management. Each locomotive instance
 * maintains its own state and can have an optional always-on-top throttle window.
 */
export class Locomotive {
    window: any;    // BrowserWindow for the throttle (null if closed)
    throttle: any;  // Current throttle state (speed, direction, functions)
    loco: any;      // Locomotive configuration data
    decoder: any;   // Decoder configuration reference

    /**
     * Creates a new locomotive control instance
     * 
     * @param {any} loco - Locomotive configuration object from database
     */
    constructor(loco: any) {
        this.window = null  // No throttle window initially
        // Initialize throttle state with decoder function mappings
        this.throttle = { 
            speed: 0, 
            direction: 'forward', 
            functions: [...makeFunctionState(loco.loco.decoder)] 
        }
        if (loco) { 
            Object.assign(this, { ...loco }) 
        }
    }
    info = () => { return { ...this } }
    setName = (newName) => this.loco.name = newName
    handleThrottleCommand = (action, data) => {
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
    }
    showThrottle = (mainWindow, idx) => {
        console.log("In show Throttle")
        if (this.window !== null) {
            console.log("Window is not Null")
            this.window.focus()
            return
        }
        const windowArg = `--windowID:${this.loco._id}`
        // Create the browser window.
        this.window = new BrowserWindow({
            width: 300,
            height: 650,
            icon: __dirname + '/throttle.ico',
            autoHideMenuBar: true,
            show: false,
            title: this.loco.name + " " + this.loco.number,
            //resizable: false,
            alwaysOnTop: true,
            webPreferences: {
                preload: join(__dirname, 'preload.js'),
                sandbox: false,
                nodeIntegration: false,
                contextIsolation: true,
                webSecurity: true,
                additionalArguments: [windowArg]
            }
        })

        let startUrl

        if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
            startUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL + "#/modal/throttle"
        } else {
            startUrl = `file://${join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)}#/modal/throttle`;
        }

        console.log("Start url=", startUrl)
        this.window.loadURL(startUrl);

        let lastRes = null
        ipcMain.handle(this.loco._id, (e, action, data) => {
            const res = this.handleThrottleCommand(action, data)
            if (JSON.stringify(res) !== lastRes) {
                mainWindow.webContents.send('throttleUpdate', idx)
                lastRes = JSON.stringify(res)
            }
            return res
        })

        // Emitted when the window is closed.
        this.window.on('closed', () => {
            ipcMain.removeHandler(this.loco._id)
            this.window = null
            mainWindow.webContents.send('checkThrottles')
        })
        this.window.on("ready-to-show", () => {
            console.log('window is ready to show')
            this.window.show()
        })
        this.window.on('moved', () => console.log(this.window.getPosition()))
    }
    closeThrottle = () => {
        if (this.window === null) return
        this.window.close()
    }
}

