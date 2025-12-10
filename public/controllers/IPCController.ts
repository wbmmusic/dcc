/**
 * IPC Controller - Inter-Process Communication Message Router
 * 
 * Central hub for all communication between the React renderer process and the main Electron process.
 * This controller implements the Command Pattern, routing UI requests to appropriate business logic services.
 * 
 * Architecture Benefits:
 * - Decouples UI from business logic
 * - Provides type-safe IPC communication
 * - Centralizes all message handling for easier maintenance
 * - Enables clean separation between presentation and domain layers
 * 
 * Message Categories:
 * - Locomotive operations (CRUD, throttle control)
 * - Switch/accessory control (DCC commands)
 * - Configuration management (backup/restore)
 * - Programming track operations (CV read/write)
 * - Real-time status updates and notifications
 */

import { ipcMain, dialog } from 'electron'
import { copyFileSync } from 'fs'
import { join, parse } from 'path'
import { BrowserWindow } from 'electron'
import type { ServiceContainer } from '../services/Container.js'
import type { StateService } from '../services/StateService.js'
import type { DCCService } from '../services/DCCService.js'
import type { WindowService } from '../services/WindowService.js'
import type { LocomotiveController } from './LocomotiveController.js'
import * as util from '../utilities.js'
import { logger } from '../Logger.js'

export class IPCController {
    private container: ServiceContainer

    constructor(container: ServiceContainer) {
        this.container = container
        this.registerHandlers()
    }

    /**
     * Register all IPC message handlers with Electron's ipcMain
     */
    private registerHandlers(): void {
        this.registerLocomotiveHandlers()
        this.registerThrottleHandlers()
        this.registerSwitchHandlers()
        this.registerDecoderHandlers()
        this.registerConsistHandlers()
        this.registerMacroHandlers()
        this.registerAccessoryHandlers()
        this.registerSettingsHandlers()
        this.registerProgrammingHandlers()
        this.registerConfigHandlers()
    }

    private registerLocomotiveHandlers(): void {
        ipcMain.handle('getLocomotives', () => util.config.locos)
        
        ipcMain.handle('selectLocoImage', async (e) => {
            try {
                const mainWindow = this.container.get<BrowserWindow>('mainWindow')
                if (!mainWindow) return "canceled"
                
                const file = await dialog.showOpenDialog(mainWindow, {
                    filters: [{
                        name: 'Images',
                        extensions: ['jpg', 'jpeg', 'bmp', 'png', 'tiff']
                    }]
                })
                
                if (!file.canceled && file.filePaths.length > 0) {
                    const sourcePath = file.filePaths[0]
                    const fileName = parse(sourcePath).base
                    const destPath = join(util.pathToImages, fileName)
                    
                    copyFileSync(sourcePath, destPath)
                    return fileName
                }
                return "canceled"
            } catch (error) {
                logger.error('Failed to select locomotive image', error)
                return "error"
            }
        })

        ipcMain.handle('createLoco', (e, loco) => util.newLoco(loco))
        ipcMain.handle('updateLocomotive', (e, editedLoco) => util.updateLoco(editedLoco))
        ipcMain.handle('deleteLocomotive', (e, id) => util.deleteLoco(id))
        ipcMain.handle('getLocomotiveById', (e, id) => util.getLocoByID(id))
    }

    private registerThrottleHandlers(): void {
        const locomotiveController = this.container.get<LocomotiveController>('locomotiveController')
        
        ipcMain.handle('mainWindowThrottle', async (e, locomotiveId, action, data) => {
            try {
                // Validate inputs
                if (!locomotiveId || typeof locomotiveId !== 'string') {
                    throw new Error('Invalid locomotive ID')
                }
                if (!action || typeof action !== 'string') {
                    throw new Error('Invalid action')
                }
                
                return await locomotiveController.handleThrottleCommand(locomotiveId, action, data)
            } catch (error) {
                logger.error('Main window throttle command failed', error)
                throw error
            }
        })

        ipcMain.on('newThrottle', async (e, id) => {
            try {
                console.log('Opening throttle for locomotive:', id)
                await locomotiveController.showThrottle(id)
                const mainWindow = this.container.get<BrowserWindow>('mainWindow')
                mainWindow?.webContents.send('throttlesOpen')
                console.log('Throttle opened successfully')
            } catch (error) {
                console.error('Error opening throttle:', error)
                logger.error('Error opening throttle', error)
            }
        })

        ipcMain.on('closeThrottles', () => {
            locomotiveController.closeAllThrottles()
        })

        ipcMain.on('checkThrottles', () => {
            const windowService = this.container.get<WindowService>('windowService')
            if (windowService.areAllThrottlesClosed()) {
                const mainWindow = this.container.get<BrowserWindow>('mainWindow')
                mainWindow?.webContents.send('throttlesClosed')
            }
        })
    }

    private registerSwitchHandlers(): void {
        const stateService = this.container.get<StateService>('stateService')
        const dccService = this.container.get<DCCService>('dccService')
        
        ipcMain.handle('getSwitches', () => {
            const state = stateService.getState()
            return Object.values(state.switches)
        })

        ipcMain.handle('createSwitch', (e, newSwitch) => util.createSwitch(newSwitch))
        ipcMain.handle('getSwitchByID', (e, id) => util.getSwitchByID(id))
        ipcMain.handle('updateSwitch', (e, editedSwitch) => util.updateSwitch(editedSwitch))
        
        ipcMain.handle('setSwitch', async (e, id, action) => {
            try {
                if (!id || typeof id !== 'string') throw new Error('Invalid switch ID')
                if (!action || typeof action !== 'string') throw new Error('Invalid switch action')
                
                const switchConfig = util.getSwitchByID(id)
                if (!switchConfig || switchConfig instanceof Error) throw new Error('Switch not found')
                
                const newState = this.calculateSwitchState(id, action, stateService)
                await dccService.setSwitch(switchConfig.address, newState)
                stateService.updateSwitch(id, newState)
                return { success: true, state: newState }
            } catch (error) {
                logger.error('Switch operation failed', error)
                throw error
            }
        })
    }

    private calculateSwitchState(id: string, action: string, stateService: StateService): boolean {
        if (action === 'open') return true
        if (action === 'close') return false
        if (action === 'toggle') {
            const currentState = stateService.getState().switches[id]
            return !currentState?.state
        }
        throw new Error('Invalid switch action')
    }

    private registerDecoderHandlers(): void {
        ipcMain.handle('getDecoders', () => util.config.decoders)
        ipcMain.handle('createDecoder', (e, decoder) => util.newDecoder(decoder))
        ipcMain.handle('deleteDecoder', (e, decoderID) => util.deleteDecoder(decoderID))
        ipcMain.handle('getDecoderById', (e, id) => util.getDecoderByID(id))
        ipcMain.handle('updateDecoder', (e, updatedDecoder) => util.updateDecoder(updatedDecoder))
    }

    private registerConsistHandlers(): void {
        ipcMain.handle('getConsists', () => util.config.consists)
        ipcMain.handle('createConsist', (e, newConsist) => util.createConsist(newConsist))
        ipcMain.handle('getConsistByID', (e, id) => util.getConsistById(id))
        ipcMain.handle('updateConsist', (e, updatedConsist) => util.updateConsist(updatedConsist))
        ipcMain.handle('deleteConsist', (e, id) => util.deleteConsist(id))
        ipcMain.handle('toggleConsist', (e, id) => util.toggleConsist(id))
    }

    private registerMacroHandlers(): void {
        ipcMain.handle('getMacros', () => util.config.macros)
        ipcMain.handle('createMacro', (e, newMacro) => util.createMacro(newMacro))
        ipcMain.handle('updateMacro', (e, editedMacro) => util.updateMacro(editedMacro))
        ipcMain.handle('getMacroByID', (e, id) => util.getMacroByID(id))
        ipcMain.handle('fireMacro', (e, macroNumber) => this.handleMacro(macroNumber))
    }

    private registerAccessoryHandlers(): void {
        ipcMain.handle('getAccessories', () => util.config.accessories)
        ipcMain.handle('createAccessory', (e, newAcc) => util.createAccessory(newAcc))
        ipcMain.handle('updateAccessory', (e, editedAcc) => util.updateAccessory(editedAcc))
        ipcMain.handle('getAccessoryByID', (e, id) => util.getAccessoryByID(id))
        ipcMain.handle('getAccessoryActions', () => [])
        ipcMain.handle('accessoryAction', (e, data) => {
            console.log('Accessory action:', data)
            return []
        })
        ipcMain.handle('toggleAcc', () => {
            console.log('Toggle accessory')
            return 'toggled'
        })
    }

    private registerSettingsHandlers(): void {
        const dccService = this.container.get<DCCService>('dccService')
        
        ipcMain.handle('getSettings', () => util.settings)
        ipcMain.handle('setUSBiface', (e, iface) => util.setUSBiface(iface))
        ipcMain.handle('setUSBport', (e, port) => util.setUSBport(port))
        ipcMain.handle('getSerialPorts', () => util.serialPorts)
        ipcMain.handle('getUsbConnection', () => dccService.isConnected())
    }

    private registerProgrammingHandlers(): void {
        const stateService = this.container.get<StateService>('stateService')
        const dccService = this.container.get<DCCService>('dccService')
        
        ipcMain.handle('getProgrammingTrackStatus', () => {
            return stateService.getState().connection.programmingTrack
        })
        
        ipcMain.handle('setProgrammingTrack', async (e, state) => {
            if (!dccService.isConnected()) return false
            
            const currentState = stateService.getState().connection.programmingTrack
            if (currentState === state) return state
            
            return state ? await dccService.enableProgrammingTrack() : await dccService.disableProgrammingTrack()
        })
        
        ipcMain.handle('readCvPrg', async (e, cv) => {
            return await dccService.readCV(cv)
        })
    }

    private registerConfigHandlers(): void {
        ipcMain.on('backupConfig', async () => {
            try {
                const mainWindow = this.container.get<BrowserWindow>('mainWindow')
                if (!mainWindow) return
                
                const file = await dialog.showSaveDialog(mainWindow, {
                    title: 'Backup config to file',
                    filters: [{ name: 'dccConfig', extensions: ['dccConfig'] }]
                })
                
                if (!file.canceled && file.filePath) {
                    try {
                        const result = await util.backupConfig(file.filePath)
                        console.log('Backup completed:', result)
                        mainWindow.webContents.send('backupComplete', { success: true })
                    } catch (error) {
                        logger.error('Backup failed', error)
                        mainWindow.webContents.send('backupComplete', { success: false, error: error instanceof Error ? error.message : 'Unknown error' })
                    }
                }
            } catch (error) {
                logger.error('Backup dialog failed', error)
            }
        })

        ipcMain.on('restoreConfig', async () => {
            try {
                const mainWindow = this.container.get<BrowserWindow>('mainWindow')
                if (!mainWindow) return
                
                const file = await dialog.showOpenDialog(mainWindow, {
                    title: 'Restore from file',
                    filters: [{ name: 'dccConfig', extensions: ['dccConfig'] }]
                })
                
                if (!file.canceled && file.filePaths.length > 0) {
                    try {
                        await util.restoreConfig(file.filePaths[0])
                        console.log('Restore completed')
                    } catch (error) {
                        logger.error('Restore failed', error)
                        mainWindow.webContents.send('restoreComplete', { success: false, error: error instanceof Error ? error.message : 'Unknown error' })
                    }
                }
            } catch (error) {
                logger.error('Restore dialog failed', error)
            }
        })
    }

    /**
     * Execute macro sequence - automated switch operations
     * 
     * Macros allow users to define sequences of switch operations that execute
     * in order, useful for setting up complex track configurations with a single command.
     * 
     * @param idx - Index of macro in configuration array
     * @returns Promise resolving when all macro actions complete
     */
    private async handleMacro(idx: number): Promise<string> {
        if (!util.config.macros[idx]) {
            throw new Error('Invalid Macro Index')
        }
        
        const actions = util.config.macros[idx].actions
        const dccService = this.container.get<DCCService>('dccService')
        const stateService = this.container.get<StateService>('stateService')
        
        for (const action of actions) {
            const switchConfig = util.getSwitchByID(action.switch)
            if (switchConfig && !(switchConfig instanceof Error)) {
                const newState = action.state === 'open'
                await dccService.setSwitch(switchConfig.address, newState)
                stateService.updateSwitch(action.switch, newState)
            }
        }
        
        return 'Macro completed'
    }
}