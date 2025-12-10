/**
 * Utilities Module
 * 
 * Core utility functions for DCC application including:
 * - Configuration file management (locomotives, decoders, switches, etc.)
 * - Settings persistence and USB interface configuration
 * - Serial port detection and management
 * - Backup/restore functionality with image preservation
 * - Database operations for all DCC entities
 * - USB device monitoring and auto-reconnection
 */

import { app } from 'electron';
import { existsSync, writeFileSync, mkdirSync, cpSync, createWriteStream, readFileSync } from 'fs';
import { join, normalize } from 'path';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import { SerialPort } from 'serialport';
import { usb } from 'usb';
import * as messenger from './messenger.js';
import type { Config, Settings, SerialPort as SerialPortType } from '../src/shared/types.js';

// APPLICATION PATHS
/** Main data directory in user's app data folder */
const pathToDataFolder = join(app.getPath('userData'), 'data')
/** Configuration file containing locomotives, decoders, switches, etc. */
const pathToConfigFile = join(pathToDataFolder, 'config.json')
/** Settings file containing USB interface and user preferences */
const pathToSettingsFile = join(pathToDataFolder, 'settings.json')
/** Directory for locomotive images uploaded by user */
const pathToImages = join(pathToDataFolder, 'images')
/** Directory for application-provided images and icons */
const pathToAppImages = join(pathToDataFolder, 'appImages')
/** Default locomotive image for new entries */
const pathToDefaultLocoImage = join(pathToImages, 'default.jpg')
export { pathToImages, pathToAppImages };

const defaultConfig: Config = { locos: [], decoders: [], switches: [], consists: [], accessories: [], macros: [] }
const defaultSettings: Settings = { usbInterface: { type: '', port: '' } }

/**
 * Initialize application directory structure and default files
 * 
 * Creates necessary directories and default configuration files if they don't exist.
 * Copies default images from application bundle to user data directory.
 */
const checkForFilesAndFolders = () => {
    if (!existsSync(pathToDataFolder)) {
        mkdirSync(pathToDataFolder)
        console.log("Created Data Folder")
    }

    if (!existsSync(pathToImages)) {
        mkdirSync(pathToImages)
        console.log("Created Images Folder")
    }

    if (!existsSync(pathToAppImages)) {
        mkdirSync(pathToAppImages)
        console.log("Created appImages Folder")
    }

    if (!existsSync(pathToConfigFile)) {
        writeFileSync(pathToConfigFile, JSON.stringify(defaultConfig, null, '\t'))
        console.log("Created config.json")
    }

    if (!existsSync(pathToSettingsFile)) {
        writeFileSync(pathToSettingsFile, JSON.stringify(defaultSettings, null, '\t'))
        console.log("Created config.json")
    }

    if (!existsSync(pathToDefaultLocoImage)) {
        try {
            cpSync(join(__dirname, 'default.jpg'), pathToDefaultLocoImage)
        } catch (error) {
            console.error('Failed to copy default image:', error instanceof Error ? error.message : 'Unknown error')
        }

        console.log("Created Default Loco Image")
    }

    if (!existsSync(join(pathToAppImages, 'locoSideProfile.png'))) {
        try {
            cpSync(join(__dirname, 'locoSideProfile.png'), join(pathToAppImages, 'locoSideProfile.png'))
        } catch (error) {
            console.error('Failed to copy side profile image:', error instanceof Error ? error.message : 'Unknown error')
        }

        console.log("Created Side Profile Loco Image")
    }
}
checkForFilesAndFolders()

let config: Config = defaultConfig
let settings: Settings = defaultSettings
export let serialPorts: SerialPortType[] = [];
export let usbConnected = false;

let window: Electron.BrowserWindow | null = null;
export const setWindow = (win: Electron.BrowserWindow) => window = win;

const readConfig = () => JSON.parse(readFileSync(pathToConfigFile, 'utf8'))
const saveConfig = () => {
    writeFileSync(pathToConfigFile, JSON.stringify(config, null, '\t'))
    readConfig()
}

const readSettings = () => JSON.parse(readFileSync(pathToSettingsFile, 'utf8'))
const saveSettings = () => {
    writeFileSync(pathToSettingsFile, JSON.stringify(settings, null, '\t'))
    readConfig()
}

config = readConfig()
settings = readSettings()
export { config, settings };

// CONSIST MANAGEMENT
/** Create a new locomotive consist (multiple units operating together) */
export const createConsist = (newConsist: any) => {
    config.consists.push(newConsist)
    saveConfig()
    return 'created'
}
export const getConsistById = (id: string) => {
    const consistIDX = config.consists.findIndex(consist => consist._id === id)
    if (consistIDX !== -1) return config.consists[consistIDX]
    else return new Error("Couldn't Find Consist with this ID")
}
export const updateConsist = (updatedConsist: any) => {
    const consistIDX = config.consists.findIndex(consist => consist._id === updatedConsist._id)
    if (consistIDX !== -1) {
        config.consists[consistIDX] = updatedConsist
        saveConfig()
        return config.consists[consistIDX]
    } else return new Error("Couldn't Update Consist with this ID")
}
export const deleteConsist = (id: string) => {
    const consistIDX = config.consists.findIndex(consist => consist._id === id)
    if (consistIDX !== -1) {
        config.consists.splice(consistIDX, 1)
        saveConfig()
        return config.consists
    } else return new Error("Couldn't Delete Consist with this ID")
}
export const toggleConsist = (id: string) => {
    const consistIDX = config.consists.findIndex(consist => consist._id === id)
    if (consistIDX !== -1) {
        config.consists[consistIDX].enabled = !config.consists[consistIDX].enabled
        saveConfig()
        return config.consists
    } else return new Error("Couldn't Toggle Consist with this ID")
}

// DECODER MANAGEMENT
/** Add a new decoder definition with function mappings */
export const newDecoder = (decoder: any) => {
    config.decoders.push(decoder)
    saveConfig()
    return 'created'
}
export const deleteDecoder = (id: string) => {
    config.decoders = config.decoders.filter(decoder => decoder._id !== id)
    saveConfig()
    return config.decoders
}
export const getDecoderByID = (id: string) => {
    return config.decoders.find(decoder => decoder._id === id)
}
export const updateDecoder = (updatedDecoder: any) => {
    let decoderIdx = config.decoders.findIndex(decoder => decoder._id === updatedDecoder._id)
    console.log("Decoder IDX", typeof decoderIdx === 'number' ? decoderIdx : 'Invalid')
    config.decoders[decoderIdx] = updatedDecoder
    saveConfig()
    return 'Updated'
}

// LOCOMOTIVE MANAGEMENT
/** Add a new locomotive to the roster */
export const newLoco = (loco: any) => {
    config.locos.push(loco)
    saveConfig()
    return 'created'
}
export const deleteLoco = (locoID: string) => {
    config.locos = config.locos.filter(loco => loco._id !== locoID)
    saveConfig()
    return config.locos
}
export const getLocoByID = (id: string) => config.locos.find((loco: any) => loco._id === id);
export const updateLoco = (editedLoco: any) => {
    let locoIdx = config.locos.findIndex(loco => loco._id === editedLoco._id)
    if (locoIdx >= 0) {
        config.locos[locoIdx] = editedLoco
        saveConfig()
        return config.locos[locoIdx]
    }
    return new Error('Locomotive not found')
}
export const moveLocomotive = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= config.locos.length || toIndex < 0 || toIndex >= config.locos.length) {
        return new Error('Invalid index')
    }
    const [movedLoco] = config.locos.splice(fromIndex, 1)
    config.locos.splice(toIndex, 0, movedLoco)
    saveConfig()
    return config.locos
}

// SWITCH MANAGEMENT
/** Get all configured switches */
export const getSwitches = () => config.switches;
export const createSwitch = (newSwitch: any) => {
    config.switches.push(newSwitch)
    saveConfig()
    return 'created'
}
export const getSwitchByID = (id: string) => {
    let switchIDX = config.switches.findIndex(sw => sw._id === id)
    if (switchIDX >= 0) return config.switches[switchIDX]
    return new Error('Error in get switch by id')
}
export const updateSwitch = (editedSwitch: any) => {
    let switchIDX = config.switches.findIndex(sw => sw._id === editedSwitch._id)
    if (switchIDX >= 0) {
        config.switches[switchIDX] = editedSwitch
        saveConfig()
        return 0
    } else return new Error("Error in update switch")
}

// MACRO MANAGEMENT
/** Create a new macro for automated switch sequences */
export const createMacro = (newMacro: any) => {
    config.macros.push(newMacro)
    saveConfig()
    return 'created'
}
export const updateMacro = (editedMacro: any) => {
    let macroIDX = config.macros.findIndex(macro => macro._id === editedMacro._id)
    if (macroIDX >= 0) {
        config.macros[macroIDX] = editedMacro
        saveConfig()
        return 'updated'
    } else return new Error('Error in updateMacro')
}
export const getMacroByID = (id: string) => {
    console.log("Macro count:", config.macros.length)
    console.log("Searching for ID:", String(id).replace(/[\r\n\x00-\x1f\x7f-\x9f]/g, ''))
    let theMacroIDX = config.macros.findIndex(macro => macro._id === id)
    if (theMacroIDX >= 0) return config.macros[theMacroIDX]
    else return new Error('Error in getMacroByID')
}

// ACCESSORY MANAGEMENT
/** Create a new DCC accessory (signals, lights, etc.) */
export const createAccessory = (newAcc: any) => {
    config.accessories.push(newAcc)
    saveConfig()
    return 'created'
}
export const updateAccessory = (editedAcc: any) => {
    let accIdx = config.accessories.findIndex(acc => acc._id === editedAcc._id)
    if (accIdx >= 0) {
        config.accessories[accIdx] = editedAcc
        saveConfig()
        return 'updated'
    }
    return new Error("Error in UpdateAccessory")
}
export const getAccessoryByID = (id: string) => {
    let accIdx = config.accessories.findIndex(acc => acc._id === id)
    if (accIdx >= 0) return config.accessories[accIdx]
    else return new Error("Error in getAccessoryByID")
}

export const backupConfig = async (outputPath: string) => {
    // Validate and sanitize output path to prevent path traversal
    const normalizedPath = normalize(join(outputPath))
    const userDataPath = normalize(app.getPath('userData'))
    const downloadsPath = normalize(app.getPath('downloads'))
    
    if (!normalizedPath.startsWith(userDataPath) && !normalizedPath.startsWith(downloadsPath)) {
        throw new Error('Invalid backup path - must be in user data or downloads directory')
    }
    
    return new Promise((resolve, reject) => {
        // create a file to stream archive data to.
        const output = createWriteStream(normalizedPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is involved
        output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve('All Zipped Up')
        });

        // This event is fired when the data source is drained no matter what was the data source.
        // It is not part of this library but rather from the NodeJS Stream API.
        // @see: https://nodejs.org/api/stream.html#stream_event_end
        output.on('end', function() {
            console.log('Data has been drained');
        });

        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                reject(err)
            }
        });

        // good practice to catch this error explicitly
        archive.on('error', function(err) {
            reject(err)
        });

        // pipe archive data to the file
        archive.pipe(output);


        // append a file
        archive.file(pathToConfigFile, { name: 'config.json' });

        // append files from a sub-directory and naming it `new-subdir` within the archive
        archive.directory(pathToImages, 'images');

        // append files from a glob pattern
        archive.glob('file*.txt', { cwd: __dirname });





        // finalize the archive (ie we are done appending files but streams have to finish yet)
        // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
        archive.finalize();
    })

}

export const restoreConfig = async (pathToZip: string) => {
    // Validate and sanitize zip path to prevent path traversal
    const normalizedPath = normalize(join(pathToZip))
    const userDataPath = normalize(app.getPath('userData'))
    const downloadsPath = normalize(app.getPath('downloads'))
    
    if (!normalizedPath.startsWith(userDataPath) && !normalizedPath.startsWith(downloadsPath)) {
        throw new Error('Invalid restore path - must be in user data or downloads directory')
    }
    
    // reading archives
    var zip = new AdmZip(normalizedPath);
    var zipEntries = zip.getEntries(); // an array of ZipEntry records

    zipEntries.forEach(function(zipEntry) {
        console.log('Processing zip entry'); // outputs zip entries information
        if (zipEntry.entryName == "my_file.txt") {
            const data = zipEntry.getData()
            if (data) {
                console.log('File data extracted successfully');
            }
        }
    });
    // extracts everything
    zip.extractAllTo( /*target path*/ pathToDataFolder, /*overwrite*/ true);
    app.relaunch()
    app.exit()
}

// SETTINGS MANAGEMENT
/** Set the USB interface type (nceUsb, etc.) */
export const setUSBiface = (iface: string) => {
    settings = {
        ...settings,
        usbInterface: {
            ...settings.usbInterface,
            type: iface
        }
    }
    saveSettings()
    return settings
}
export const setUSBport = (port: string) => {
    settings = {
        ...settings,
        usbInterface: {
            ...settings.usbInterface,
            port: port
        }
    }
    saveSettings()
    return settings
}

const listPorts = async(): Promise<SerialPortType[]> => {
    try {
        const ports = await SerialPort.list()
        return ports.map(port => ({
            path: port.path,
            serialNumber: port.serialNumber || ''
        }))
    } catch (err) {
        console.error('Error listing ports:', err instanceof Error ? err.message : 'Unknown error')
        return []
    }
}

const interfaceIsConfigured = () => {
    if (settings.usbInterface.type === '' || settings.usbInterface.port === '') {
        console.log(("No interface specified in settings.config"))
        return false
    } else return true
}

const updatePorts = async() => {
    try {
        const ports = await listPorts()
        if (JSON.stringify(serialPorts) !== JSON.stringify(ports)) {
            serialPorts = ports
            if (window) window.webContents.send('serialPorts', serialPorts)
            return true
        }
        return false
    } catch (error) {
        console.error('Failed to update ports:', error instanceof Error ? error.message : 'Unknown error')
        return false
    }
}

const ourPortIsAvailable = () => {
    const portIDX = serialPorts.findIndex(port => port.path === settings.usbInterface.port)
    if (portIDX >= 0) return true
    return false
}

const setConnectedStatus = (status: boolean) => {
    console.log("Setting connection status:", Boolean(status))
    usbConnected = status
    if (window) window.webContents.send('usbConnection', status)
    if (!status) {
        // Reset interface when disconnected
        Object.assign(messenger, { dccInterface: null })
    }
}

const doWeCareAboutThisUSBdevice = async() => {
    try {
        if (await updatePorts()) {
            // if we are already connected all we need to do is send new ports to window
            if (usbConnected) return
            console.log("USB not already connected")
            if (ourPortIsAvailable()) {
                try {
                    messenger.startInterface(settings.usbInterface, setConnectedStatus)
                } catch (error) {
                    console.error('Failed to start interface:', error instanceof Error ? error.message : 'Unknown error')
                }
            } else {
                console.log("Port not available")
            }
        }
    } catch (error) {
        console.error('Error checking USB device:', error instanceof Error ? error.message : 'Unknown error')
    }
}

const bootInterface = async() => {
    try {
        await updatePorts()
        if (!interfaceIsConfigured()) return
        if (ourPortIsAvailable()) {
            try {
                messenger.startInterface(settings.usbInterface, setConnectedStatus)
            } catch (error) {
                console.error('Failed to start interface on boot:', error instanceof Error ? error.message : 'Unknown error')
            }
        } else {
            console.log("Port not available")
        }
    } catch (error) {
        console.error('Error during interface boot:', error instanceof Error ? error.message : 'Unknown error')
    }
}

const handleRemove = async() => {
    try {
        if (await updatePorts()) {
            if (!ourPortIsAvailable()) {
                setConnectedStatus(false)
            }
        }
    } catch (error) {
        console.error('Error handling USB removal:', error instanceof Error ? error.message : 'Unknown error')
    }
}

bootInterface()

usb.on('attach', () => doWeCareAboutThisUSBdevice())
usb.on('detach', () => handleRemove())