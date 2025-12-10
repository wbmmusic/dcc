/**
 * Window Service - UI Window Management
 * 
 * Manages throttle windows and main window updates.
 * Listens to state changes and updates UI accordingly.
 */

import { BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import type { StateService } from './StateService.js'

// Vite build configuration
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

export class WindowService {
    private mainWindow: BrowserWindow | null = null
    private throttleWindows = new Map<string, BrowserWindow>()
    private stateService: StateService

    constructor(stateService: StateService) {
        this.stateService = stateService
        this.setupStateListeners()
    }

    /**
     * Set main window reference
     */
    setMainWindow(window: BrowserWindow): void {
        this.mainWindow = window
    }

    /**
     * Create throttle window for locomotive
     */
    async createThrottleWindow(locomotiveId: string, locomotiveData: any): Promise<BrowserWindow> {
        // Close existing window if open
        if (this.throttleWindows.has(locomotiveId)) {
            const existingWindow = this.throttleWindows.get(locomotiveId)!
            existingWindow.focus()
            return existingWindow
        }

        const windowArg = `--windowID:${locomotiveId}`
        
        const throttleWindow = new BrowserWindow({
            width: 300,
            height: 650,
            icon: join(__dirname, '/throttle.ico'),
            autoHideMenuBar: true,
            show: false,
            title: `${locomotiveData.name} ${locomotiveData.number}`,
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

        // Load throttle UI
        let startUrl: string
        if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
            startUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL + "#/modal/throttle"
        } else {
            startUrl = `file://${join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)}#/modal/throttle`
        }

        throttleWindow.loadURL(startUrl)

        // Setup IPC handler for this locomotive
        ipcMain.handle(locomotiveId, (e, action, data) => {
            // Delegate to locomotive controller via events
            return new Promise((resolve) => {
                this.stateService.emit('throttleCommand', {
                    locomotiveId,
                    action,
                    data,
                    callback: resolve
                })
            })
        })

        // Handle window events
        throttleWindow.on('closed', () => {
            ipcMain.removeHandler(locomotiveId)
            this.throttleWindows.delete(locomotiveId)
            this.notifyMainWindow('checkThrottles')
        })

        throttleWindow.on('ready-to-show', () => {
            throttleWindow.show()
        })

        this.throttleWindows.set(locomotiveId, throttleWindow)
        return throttleWindow
    }

    /**
     * Close throttle window
     */
    closeThrottleWindow(locomotiveId: string): void {
        const window = this.throttleWindows.get(locomotiveId)
        if (window) {
            window.close()
        }
    }

    /**
     * Close all throttle windows
     */
    closeAllThrottles(): void {
        this.throttleWindows.forEach(window => window.close())
        this.throttleWindows.clear()
    }

    /**
     * Focus throttle window
     */
    focusThrottle(locomotiveId: string): void {
        const window = this.throttleWindows.get(locomotiveId)
        if (window) {
            if (window.isMinimized()) window.restore()
            window.focus()
        }
    }

    /**
     * Check if all throttles are closed
     */
    areAllThrottlesClosed(): boolean {
        return this.throttleWindows.size === 0
    }

    /**
     * Send message to main window
     */
    private notifyMainWindow(channel: string, ...args: any[]): void {
        if (this.mainWindow) {
            this.mainWindow.webContents.send(channel, ...args)
        }
    }

    /**
     * Setup state change listeners
     */
    private setupStateListeners(): void {
        this.stateService.on('locomotiveChanged', (locomotiveId: string, state: any) => {
            // Update throttle window if open
            const window = this.throttleWindows.get(locomotiveId)
            if (window) {
                window.webContents.send('modalThrottleUpdate')
            }
            
            // Notify main window
            this.notifyMainWindow('throttleUpdate', locomotiveId)
        })

        this.stateService.on('connectionChanged', (connection: any) => {
            this.notifyMainWindow('usbConnection', connection.connected)
        })

        this.stateService.on('switchChanged', (switchId: string, state: boolean) => {
            this.notifyMainWindow('switchUpdate', switchId, state)
        })

        this.stateService.on('stateChanged', (state: any) => {
            // Broadcast general state updates
            this.notifyMainWindow('stateUpdate', state)
        })
    }
}