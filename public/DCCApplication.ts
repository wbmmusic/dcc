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
        await app.whenReady()
        
        this.registerProtocols()
        this.createMainWindow()
        this.initializeServices()
        this.setupApplicationEvents()
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
            const fileName = request.url.replace('loco://', '')
            const imagePath = normalize(`${util.pathToImages}/${fileName}`)
            return net.fetch(`file://${imagePath}`)
        })

        protocol.handle('aimg', (request) => {
            const imagePath = normalize(`${util.pathToAppImages}/${request.url.substring(7)}`)
            return net.fetch(`file://${imagePath}`)
        })
    }

    /**
     * Create main application window
     */
    private createMainWindow(): void {
        this.mainWindow = new BrowserWindow({
            width: 950,
            height: 750,
            icon: join(__dirname, '/icon.ico'),
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
            this.mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
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
        const stateService = this.container.get<StateService>('stateService')
        const dccService = this.container.get<DCCService>('dccService')

        // Initialize state from config
        stateService.initializeFromConfig(util.config)

        // Setup React ready handler
        this.mainWindow?.webContents.once('dom-ready', () => {
            this.mainWindow?.webContents.send('message', 'React Is Ready')
            
            // Initialize DCC interface if configured
            if (util.settings.usbInterface.port) {
                dccService.initialize(util.settings).catch(console.error)
            }
        })

        // Initialize IPC handlers
        this.container.get('ipcController')
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
                const dccService = this.container.get<DCCService>('dccService')
                dccService.close()
                app.quit()
            }
        })
    }
}