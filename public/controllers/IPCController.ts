/**
 * IPC Controller - Message Routing
 * 
 * Routes IPC messages from renderer to appropriate services.
 * Keeps main.ts clean by handling all IPC registration.
 */

import { ipcMain, dialog } from 'electron'
import { copyFileSync } from 'fs'
import { join, parse } from 'path'
import type { ServiceContainer } from '../services/Container.js'
import type { StateService } from '../services/StateService.js'
import type { DCCService } from '../services/DCCService.js'
import type { WindowService } from '../services/WindowService.js'
import type { LocomotiveController } from './LocomotiveController.js'
import * as util from '../utilities.js'

export class IPCController {
    private container: ServiceContainer

    constructor(container: ServiceContainer) {
        this.container = container
        this.registerHandlers()
    }

    private registerHandlers(): void {
        const stateService = this.container.get<StateService>('stateService')
        const dccService = this.container.get<DCCService>('dccService')
        const locomotiveController = this.container.get<LocomotiveController>('locomotiveController')

        // LOCOMOTIVE HANDLERS
        ipcMain.handle('getLocomotives', () => util.config.locos)
        
        ipcMain.handle('selectLocoImage', async (e) => {
            const mainWindow = this.container.get('mainWindow') as any
            if (!mainWindow) return "canceled"
            
            const file = await dialog.showOpenDialog(mainWindow, {
                filters: [{
                    name: 'Images',
                    extensions: ['jpg', 'jpeg', 'bmp', 'png', 'tiff']
                }]
            })
            
            if (!file.canceled) {
                copyFileSync(file.filePaths[0], join(util.pathToImages, parse(file.filePaths[0]).base))
                return parse(file.filePaths[0]).base
            }
            return "canceled"
        })

        ipcMain.handle('createLoco', (e, loco) => util.newLoco(loco))
        ipcMain.handle('updateLocomotive', (e, editedLoco) => util.updateLoco(editedLoco))
        ipcMain.handle('deleteLocomotive', (e, id) => util.deleteLoco(id))
        ipcMain.handle('getLocomotiveById', (e, id) => util.getLocoByID(id))

        // THROTTLE HANDLERS
        ipcMain.handle('mainWindowThrottle', async (e, locoIdx, action, data) => {
            // Get locomotive ID from index
            const locomotive = util.config.locos[locoIdx]
            if (!locomotive) throw new Error('Locomotive not found')
            
            return locomotiveController.handleThrottleCommand(locomotive._id, action, data)
        })

        ipcMain.on('newThrottle', async (e, id) => {
            try {
                await locomotiveController.showThrottle(id)
                const mainWindow = this.container.get('mainWindow') as any
                mainWindow?.webContents.send('throttlesOpen')
            } catch (error) {
                console.error('Error opening throttle:', error)
            }
        })

        ipcMain.on('closeThrottles', () => {
            locomotiveController.closeAllThrottles()
        })

        ipcMain.on('checkThrottles', () => {
            const windowService = this.container.get<WindowService>('windowService')
            if (windowService.areAllThrottlesClosed()) {
                const mainWindow = this.container.get('mainWindow') as any
                mainWindow?.webContents.send('throttlesClosed')
            }
        })

        // SWITCH HANDLERS
        ipcMain.handle('getSwitches', () => {
            const state = stateService.getState()
            return Object.values(state.switches)
        })

        ipcMain.handle('createSwitch', (e, newSwitch) => util.createSwitch(newSwitch))
        ipcMain.handle('getSwitchByID', (e, id) => util.getSwitchByID(id))
        ipcMain.handle('updateSwitch', (e, editedSwitch) => util.updateSwitch(editedSwitch))
        
        ipcMain.handle('setSwitch', async (e, id, action) => {
            const switchConfig = util.getSwitchByID(id)
            if (!switchConfig || switchConfig instanceof Error) {
                throw new Error('Switch not found')
            }
            
            let newState: boolean
            if (action === 'open') newState = true
            else if (action === 'close') newState = false
            else if (action === 'toggle') {
                const currentState = stateService.getState().switches[id]
                newState = !currentState?.state
            } else {
                throw new Error('Invalid switch action')
            }
            
            await dccService.setSwitch(switchConfig.address, newState)
            stateService.updateSwitch(id, newState)
        })

        // DECODER HANDLERS
        ipcMain.handle('getDecoders', () => util.config.decoders)
        ipcMain.handle('createDecoder', (e, decoder) => util.newDecoder(decoder))
        ipcMain.handle('deleteDecoder', (e, decoderID) => util.deleteDecoder(decoderID))
        ipcMain.handle('getDecoderById', (e, id) => util.getDecoderByID(id))
        ipcMain.handle('updateDecoder', (e, updatedDecoder) => util.updateDecoder(updatedDecoder))

        // CONSIST HANDLERS
        ipcMain.handle('getConsists', () => util.config.consists)
        ipcMain.handle('createConsist', (e, newConsist) => util.createConsist(newConsist))
        ipcMain.handle('getConsistByID', (e, id) => util.getConsistById(id))
        ipcMain.handle('updateConsist', (e, updatedConsist) => util.updateConsist(updatedConsist))
        ipcMain.handle('deleteConsist', (e, id) => util.deleteConsist(id))
        ipcMain.handle('toggleConsist', (e, id) => util.toggleConsist(id))

        // MACRO HANDLERS
        ipcMain.handle('getMacros', () => util.config.macros)
        ipcMain.handle('createMacro', (e, newMacro) => util.createMacro(newMacro))
        ipcMain.handle('updateMacro', (e, editedMacro) => util.updateMacro(editedMacro))
        ipcMain.handle('getMacroByID', (e, id) => util.getMacroByID(id))
        ipcMain.handle('fireMacro', (e, macroNumber) => this.handleMacro(macroNumber))

        // ACCESSORY HANDLERS
        ipcMain.handle('getAccessories', () => util.config.accessories)
        ipcMain.handle('createAccessory', (e, newAcc) => util.createAccessory(newAcc))
        ipcMain.handle('updateAccessory', (e, editedAcc) => util.updateAccessory(editedAcc))
        ipcMain.handle('getAccessoryByID', (e, id) => util.getAccessoryByID(id))
        
        ipcMain.handle('getAccessoryActions', () => {
            // Return empty array for now - accessories not fully implemented in new architecture
            return []
        })
        
        ipcMain.handle('accessoryAction', (e, data) => {
            // Placeholder for accessory actions
            console.log('Accessory action:', data)
            return []
        })
        
        ipcMain.handle('toggleAcc', () => {
            // Placeholder for accessory toggle
            console.log('Toggle accessory')
            return 'toggled'
        })

        // SETTINGS HANDLERS
        ipcMain.handle('getSettings', () => util.settings)
        ipcMain.handle('setUSBiface', (e, iface) => util.setUSBiface(iface))
        ipcMain.handle('setUSBport', (e, port) => util.setUSBport(port))
        ipcMain.handle('getSerialPorts', () => util.serialPorts)
        ipcMain.handle('getUsbConnection', () => dccService.isConnected())

        // PROGRAMMING TRACK HANDLERS
        ipcMain.handle('getProgrammingTrackStatus', () => {
            return stateService.getState().connection.programmingTrack
        })
        
        ipcMain.handle('setProgrammingTrack', async (e, state) => {
            if (!dccService.isConnected()) return false
            
            const currentState = stateService.getState().connection.programmingTrack
            if (currentState === state) return state
            
            if (state) {
                return await dccService.enableProgrammingTrack()
            } else {
                return await dccService.disableProgrammingTrack()
            }
        })
        
        ipcMain.handle('readCvPrg', async (e, cv) => {
            return await dccService.readCV(cv)
        })

        // CONFIG HANDLERS
        ipcMain.on('backupConfig', async () => {
            const mainWindow = this.container.get('mainWindow') as any
            if (!mainWindow) return
            
            const file = await dialog.showSaveDialog(mainWindow, {
                title: 'Backup config to file',
                filters: [{ name: 'dccConfig', extensions: ['dccConfig'] }]
            })
            
            if (!file.canceled) {
                try {
                    const zip = await util.backupConfig(file.filePath)
                    console.log(zip)
                } catch (error) {
                    throw error
                }
            }
        })

        ipcMain.on('restoreConfig', async () => {
            const mainWindow = this.container.get('mainWindow') as any
            if (!mainWindow) return
            
            const file = await dialog.showOpenDialog(mainWindow, {
                title: 'Restore from file',
                filters: [{ name: 'dccConfig', extensions: ['dccConfig'] }]
            })
            
            if (!file.canceled) {
                util.restoreConfig(file.filePaths[0])
            }
        })
    }

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