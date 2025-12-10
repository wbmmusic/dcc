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
        try {
            // Close existing window if open
            if (this.throttleWindows.has(locomotiveId)) {
                const existingWindow = this.throttleWindows.get(locomotiveId)!
                existingWindow.focus()
                return existingWindow
            }

            // Validate locomotive ID to prevent injection
            if (!locomotiveId || typeof locomotiveId !== 'string' || locomotiveId.includes('..')) {
                throw new Error('Invalid locomotive ID')
            }

            const windowArg = `--windowID:${locomotiveId}`
            
            console.log('Creating throttle window for locomotive:', locomotiveData)
            console.log('Locomotive number:', locomotiveData.number)
            
            const throttleWindow = new BrowserWindow({
                width: 300,
                height: 650,
                icon: join(__dirname, 'throttle.ico'),
                autoHideMenuBar: true,
                show: true,
                title: `${locomotiveData.number}`,
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
                startUrl = `file://${join(__dirname, '..', 'renderer', 'index.html')}#/modal/throttle`
            }

            // Setup IPC handler for this locomotive BEFORE loading URL
            ipcMain.handle(locomotiveId, async (e, action, data) => {
                try {
                    // Delegate to locomotive controller via events
                    return new Promise((resolve, reject) => {
                        this.stateService.emit('throttleCommand', {
                            locomotiveId,
                            action,
                            data,
                            callback: (result: any) => {
                                if (result && result.error) reject(new Error(result.error))
                                else resolve(result)
                            }
                        })
                    })
                } catch (error) {
                    console.error('Failed to handle throttle command:', error)
                    return { error: 'Command failed', details: error instanceof Error ? error.message : 'Unknown error' }
                }
            })

            await throttleWindow.loadURL(startUrl)

            // Handle window events
            throttleWindow.on('closed', () => {
                try {
                    ipcMain.removeHandler(locomotiveId)
                    this.throttleWindows.delete(locomotiveId)
                    this.notifyMainWindow('checkThrottles')
                } catch (error) {
                    console.error('Error cleaning up throttle window:', error)
                }
            })



            throttleWindow.on('ready-to-show', () => {
                throttleWindow.show()
            })

            this.throttleWindows.set(locomotiveId, throttleWindow)
            return throttleWindow
        } catch (error) {
            console.error('Failed to create throttle window:', error)
            throw error
        }
    }

    /**
     * Close throttle window
     */
    closeThrottleWindow(locomotiveId: string): void {
        try {
            const window = this.throttleWindows.get(locomotiveId)
            if (window) {
                window.close()
            }
        } catch (error) {
            console.error('Failed to close throttle window:', error)
        }
    }

    /**
     * Close all throttle windows
     */
    closeAllThrottles(): void {
        try {
            this.throttleWindows.forEach(window => {
                try {
                    window.close()
                } catch (error) {
                    console.error('Failed to close individual throttle window:', error)
                }
            })
            this.throttleWindows.clear()
        } catch (error) {
            console.error('Failed to close all throttle windows:', error)
        }
    }

    /**
     * Focus throttle window
     */
    focusThrottle(locomotiveId: string): void {
        try {
            const window = this.throttleWindows.get(locomotiveId)
            if (window) {
                if (window.isMinimized()) window.restore()
                window.focus()
            }
        } catch (error) {
            console.error('Failed to focus throttle window:', error)
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
        try {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.webContents.send(channel, ...args)
            }
        } catch (error) {
            console.error('Failed to notify main window:', error)
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