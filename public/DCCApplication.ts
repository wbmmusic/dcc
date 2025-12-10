/**
 * DCC Application - Main Application Class
 * 
 * Orchestrates all services and manages application lifecycle.
 * Clean bootstrap with dependency injection.
 */

import { app, BrowserWindow, protocol, net } from 'electron'
import { join, normalize } from 'path'
import { ServiceContainer } from './services/Container.js'
import { StateService } from './services/StateService.js'
import { DCCService } from './services/DCCService.js'
import { WindowService } from './services/WindowService.js'
import { LocomotiveController } from './controllers/LocomotiveController.js'
import { IPCController } from './controllers/IPCController.js'
import * as util from './utilities.js'

// Vite build configuration constants
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

export class DCCApplication {
    private container: ServiceContainer
    private mainWindow: BrowserWindow | null = null

    constructor() {
        this.container = new ServiceContainer()
        this.registerServices()
    }

    /**
     * Start the application
     */
    async start(): Promise<void> {
        try {
            await app.whenReady()
            
            this.registerProtocols()
            this.createMainWindow()
            await this.initializeServices()
            this.setupApplicationEvents()
        } catch (error) {
            console.error('Failed to start DCC application:', error)
            app.quit()
        }
    }

    /**
     * Register all services in the container
     */
    private registerServices(): void {
        // Core services
        this.container.register('stateService', () => new StateService())
        
        this.container.register('dccService', () => 
            new DCCService(this.container.get('stateService'))
        )
        
        this.container.register('windowService', () => 
            new WindowService(this.container.get('stateService'))
        )

        // Controllers
        this.container.register('locomotiveController', () => 
            new LocomotiveController(
                this.container.get('dccService'),
                this.container.get('stateService'),
                this.container.get('windowService')
            )
        )

        this.container.register('ipcController', () => 
            new IPCController(this.container)
        )

        // Main window (registered after creation)
        this.container.register('mainWindow', () => this.mainWindow)
    }

    /**
     * Register custom protocols for image loading
     */
    private registerProtocols(): void {
        protocol.handle('loco', (request) => {
            try {
                const fileName = request.url.replace('loco://', '')
                // Validate filename to prevent path traversal
                if (!fileName || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\') || fileName.includes('\0')) {
                    throw new Error('Invalid filename')
                }
                const imagePath = join(util.pathToImages, fileName)
                // Ensure resolved path is within images directory
                if (!imagePath.startsWith(util.pathToImages)) {
                    throw new Error('Path traversal attempt detected')
                }
                return net.fetch(`file://${imagePath}`)
            } catch (error) {
                console.error('Failed to load locomotive image:', error)
                throw error
            }
        })

        protocol.handle('appimg', (request) => {
            try {
                const fileName = request.url.replace('appimg://', '')
                // Validate filename to prevent path traversal
                if (!fileName || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\') || fileName.includes('\0')) {
                    throw new Error('Invalid filename')
                }
                const imagePath = join(util.pathToAppImages, fileName)
                // Ensure resolved path is within app images directory
                if (!imagePath.startsWith(util.pathToAppImages)) {
                    throw new Error('Path traversal attempt detected')
                }
                return net.fetch(`file://${imagePath}`)
            } catch (error) {
                console.error('Failed to load app image:', error)
                throw error
            }
        })
    }

    /**
     * Create main application window
     */
    private createMainWindow(): void {
        this.mainWindow = new BrowserWindow({
            width: 950,
            height: 750,
            icon: join(__dirname, 'icon.ico'),
            autoHideMenuBar: true,
            show: false,
            title: 'Big D\'s Railroad v' + app.getVersion(),
            webPreferences: {
                preload: join(__dirname, 'preload.js'),
                sandbox: false,
                nodeIntegration: false,
                contextIsolation: true,
                webSecurity: true
            }
        })

        // Load main UI
        if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
            this.mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
        } else {
            this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
        }

        this.mainWindow.on('closed', () => app.quit())
        this.mainWindow.on('ready-to-show', () => this.mainWindow?.show())
        


        // Register window with services
        const windowService = this.container.get<WindowService>('windowService')
        windowService.setMainWindow(this.mainWindow)
    }

    /**
     * Initialize services after window creation
     */
    private async initializeServices(): Promise<void> {
        try {
            const stateService = this.container.get<StateService>('stateService')
            const dccService = this.container.get<DCCService>('dccService')

            // Initialize state from config
            stateService.initializeFromConfig(util.config)

            // Setup React ready handler
            this.mainWindow?.webContents.once('dom-ready', async () => {
                try {
                    this.mainWindow?.webContents.send('message', 'React Is Ready')
                    
                    // Initialize DCC interface if configured
                    if (util.settings.usbInterface.port) {
                        try {
                            await dccService.initialize(util.settings)
                        } catch (error) {
                            console.error('Failed to initialize DCC service:', error)
                        }
                    }
                } catch (error) {
                    console.error('Failed to setup React ready handler:', error)
                }
            })

            // Initialize IPC handlers
            this.container.get('ipcController')
        } catch (error) {
            console.error('Failed to initialize services:', error)
            throw error
        }
    }

    /**
     * Setup application-level event handlers
     */
    private setupApplicationEvents(): void {
        // Single instance lock
        const gotTheLock = app.requestSingleInstanceLock()
        if (!gotTheLock) {
            app.quit()
            return
        }

        app.on('second-instance', () => {
            if (this.mainWindow) {
                if (this.mainWindow.isMinimized()) this.mainWindow.restore()
                this.mainWindow.focus()
            }
        })

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow()
            }
        })

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                try {
                    const dccService = this.container.get<DCCService>('dccService')
                    dccService.close()
                } catch (error) {
                    console.error('Failed to close DCC service:', error)
                } finally {
                    app.quit()
                }
            }
        })
    }
}