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
import type { Config, Decoder } from '../src/shared/types.js';

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
    try {
        // Find the decoder configuration for this locomotive
        const decoder = config.decoders.find(d => d._id === decoderID)
        if (!decoder) {
            throw new Error(`Decoder ${decoderID} not found`)
        }

        // Create function state array (F0-F28 = 29 functions)
        const functions = []
        for (let i = 0; i < 29; i++) {
            functions.push({ ...decoder.functions[i], state: false })
        }
        return functions
    } catch (error) {
        console.error('Failed to create function state:', error)
        throw error
    }
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
    constructor(locoData: any) {
        this.window = null
        
        // Validate and safely assign locomotive data
        if (!locoData?.loco) {
            throw new Error('Invalid locomotive data provided')
        }
        
        try {
            // Initialize throttle state with decoder function mappings
            this.throttle = { 
                speed: 0, 
                direction: 'forward', 
                functions: [...makeFunctionState(locoData.loco.decoder)] 
            }
            
            // Safely assign only expected properties
            this.loco = { ...locoData.loco }
            this.decoder = locoData.decoder
        } catch (error) {
            console.error('Failed to initialize locomotive:', error)
            throw error
        }
    }
    info = () => { return { ...this } }
    setName = (newName: string) => this.loco.name = newName
    handleThrottleCommand = (action: string, data?: any) => {
        try {
            switch (action) {
                case 'getThrottle':
                    console.log('Got Throttle Data Request')
                    return { ...this.throttle, ...this.loco, decoder: this.decoder }

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
        } catch (error) {
            console.error(`Failed to handle throttle command ${action}:`, error)
            throw error
        }
    }
    showThrottle = (mainWindow: any, idx: number) => {
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
            icon: join(__dirname, 'throttle.ico'),
            autoHideMenuBar: true,
            show: false,
            title: `${this.loco.name} ${this.loco.number}`,
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

        try {
            if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
                startUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL + "#/modal/throttle"
            } else {
                startUrl = `file://${join(__dirname, `../renderer/index.html`)}#/modal/throttle`
            }

            console.log("Start url=", startUrl)
            await this.window.loadURL(startUrl)
        } catch (error) {
            console.error('Failed to load throttle window URL:', error)
            if (this.window) {
                this.window.close()
                this.window = null
            }
            throw error
        }

        let lastRes: string | null = null
        ipcMain.handle(this.loco._id, async (e, action, data) => {
            try {
                const res = await this.handleThrottleCommand(action, data)
                if (JSON.stringify(res) !== lastRes) {
                    mainWindow.webContents.send('throttleUpdate', idx)
                    lastRes = JSON.stringify(res)
                }
                return res
            } catch (error) {
                console.error('Failed to handle throttle command:', error)
                return { error: 'Command failed', details: error instanceof Error ? error.message : 'Unknown error' }
            }
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

