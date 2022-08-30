const { app } = require('electron')
const { existsSync, writeFileSync, mkdirSync, cpSync, createWriteStream, readFileSync } = require('fs')
const { join } = require('path')
const archiver = require('archiver');
var AdmZip = require("adm-zip");
const SerialPort = require('serialport')
const { usb } = require('usb');
const messenger = require('./messenger');
const { locoObjects } = require('./main');

// PATHS
const pathToDataFolder = join(app.getPath('userData'), 'data')
const pathToConfigFile = join(pathToDataFolder, 'config.json')
const pathToSettingsFile = join(pathToDataFolder, 'settings.json')
const pathToImages = join(pathToDataFolder, 'images')
const pathToAppImages = join(pathToDataFolder, 'appImages')
const pathToDefaultLocoImage = join(pathToImages, 'default.jpg')
exports.pathToImages = pathToImages
exports.pathToAppImages = pathToAppImages

const defaultConfig = { locos: [], decoders: [], switches: [], consists: [], accessories: [], macros: [] }
const defaultSettings = { usbInterface: { type: '', port: '' } }

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
            console.log(error)
        }

        console.log("Created Default Loco Image")
    }

    if (!existsSync(join(pathToAppImages, 'locoSideProfile.png'))) {
        try {
            cpSync(join(__dirname, 'locoSideProfile.png'), join(pathToAppImages, 'locoSideProfile.png'))
        } catch (error) {
            console.log(error)
        }

        console.log("Created Side Profile Loco Image")
    }
}
checkForFilesAndFolders()

let config = {}
let settings = {}
exports.serialPorts = []
exports.usbConnected = false

let window
exports.setWindow = (win) => window = win

const readConfig = () => JSON.parse(readFileSync(pathToConfigFile))
const saveConfig = () => {
    writeFileSync(pathToConfigFile, JSON.stringify(config, null, '\t'))
    readConfig()
}

const readSettings = () => JSON.parse(readFileSync(pathToSettingsFile))
const saveSettings = () => {
    writeFileSync(pathToSettingsFile, JSON.stringify(settings, null, '\t'))
    readConfig()
}

config = readConfig()
settings = readSettings()
exports.config = config
exports.settings = settings

// CONSISTS
exports.createConsist = (newConsist) => {
    config.consists.push(newConsist)
    saveConfig()
    return 'created'
}
exports.getConsistById = (id) => {
    const consistIDX = config.consists.findIndex(consist => consist._id === id)
    if (consistIDX !== -1) return config.consists[consistIDX]
    else return new Error("Couldn't Find Consist with this ID")
}
exports.updateConsist = (updatedConsist) => {
    const consistIDX = config.consists.findIndex(consist => consist._id === updatedConsist._id)
    if (consistIDX !== -1) {
        config.consists[consistIDX] = updatedConsist
        saveConfig()
        return config.consists[consistIDX]
    } else return new Error("Couldn't Update Consist with this ID")
}
exports.deleteConsist = (id) => {
    const consistIDX = config.consists.findIndex(consist => consist._id === id)
    if (consistIDX !== -1) {
        config.consists.splice(consistIDX, 1)
        saveConfig()
        return config.consists
    } else return new Error("Couldn't Delete Consist with this ID")
}
exports.toggleConsist = (id) => {
    const consistIDX = config.consists.findIndex(consist => consist._id === id)
    if (consistIDX !== -1) {
        config.consists[consistIDX].enabled = !config.consists[consistIDX].enabled
        saveConfig()
        return config.consists
    } else return new Error("Couldn't Toggle Consist with this ID")
}

// DECODERS
exports.newDecoder = decoder => {
    config.decoders.push(decoder)
    saveConfig()
    return 'created'
}
exports.deleteDecoder = id => {
    config.decoders = config.decoders.filter(dcdr => dcdr._id !== id)
    saveConfig()
    return config.decoders
}
exports.getDecoderByID = id => {
    return config.decoders.find(dcdr => dcdr._id === id)
}
exports.updateDecoder = updatedDecoder => {
    let decoderIdx = config.decoders.findIndex(dcdr => dcdr._id === updatedDecoder._id)
    console.log("DCDR IDX", decoderIdx)
    config.decoders[decoderIdx] = updatedDecoder
    saveConfig()
    return 'Updated'
}

// LOCOMOTIVES
exports.newLoco = loco => {
    config.locos.push(loco)
    saveConfig()
    return 'created'
}
exports.deleteLoco = locoID => {
    config.locos = config.locos.filter(loco => loco._id !== locoID)
    saveConfig()
    return config.locos
}
exports.getLocoByID = id => config.locos.find(loco => loco._id === id)
exports.updateLoco = editedLoco => {
    let locoIdx = config.locos.findIndex(loco => loco._id === editedLoco._id)
    if (locoIdx >= 0) {
        config.locos[locoIdx] = editedLoco
        saveConfig()
        return config.locos[locoIdx]
    }
}

// SWITCHES
exports.getSwitches = () => config.switches
exports.createSwitch = newSwitch => {
    config.switches.push(newSwitch)
    saveConfig()
    return 'created'
}
exports.getSwitchByID = id => {
    let switchIDX = config.switches.findIndex(sw => sw._id === id)
    if (switchIDX >= 0) return config.switches[switchIDX]
    return new Error('Error in get switch by id')
}
exports.updateSwitch = editedSwitch => {
    let switchIDX = config.switches.findIndex(sw => sw._id === editedSwitch._id)
    if (switchIDX >= 0) {
        config.switches[switchIDX] = editedSwitch
        saveConfig()
        return 0
    } else return new Error("Error in update switch")
}

// MACROS
exports.createMacro = newMacro => {
    config.macros.push(newMacro)
    saveConfig()
    return 'created'
}
exports.updateMacro = editedMacro => {
    let macroIDX = config.macros.findIndex(mcro => mcro._id === editedMacro._id)
    if (macroIDX >= 0) {
        config.macros[macroIDX] = editedMacro
        saveConfig()
        return 'updated'
    } else return new Error('Error in updateMacro')
}
exports.getMacroByID = id => {
    console.log(config.macros)
    console.log(id)
    let theMacroIDX = config.macros.findIndex(mcro => mcro._id === id)
    if (theMacroIDX >= 0) return config.macros[theMacroIDX]
    else return new Error('Error in getMacroByID')
}

// ACCESSORIES
exports.createAccessory = newAcc => {
    config.accessories.push(newAcc)
    saveConfig()
    return 'created'
}
exports.updateAccessory = editedAcc => {
    let accIdx = config.accessories.findIndex(acc => acc._id === editedAcc._id)
    if (accIdx >= 0) config.accessories[accIdx] = editedAcc
    else return new Error("Error in UpdateAccessory")
}
exports.getAccessoryByID = id => {
    let accIdx = config.accessories.findIndex(acc => acc._id === id)
    if (accIdx >= 0) return config.accessories[accIdx]
    else return new Error("Error in getAccessoryByID")
}

exports.backupConfig = async(outputPath) => {
    return new Promise((resolve, reject) => {
        // create a file to stream archive data to.
        const output = createWriteStream(outputPath);
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

exports.restoreConfig = async(pathToZip) => {
    // reading archives
    var zip = new AdmZip(pathToZip);
    var zipEntries = zip.getEntries(); // an array of ZipEntry records

    zipEntries.forEach(function(zipEntry) {
        console.log(zipEntry.toString()); // outputs zip entries information
        if (zipEntry.entryName == "my_file.txt") {
            console.log(zipEntry.getData().toString("utf8"));
        }
    });
    // extracts everything
    zip.extractAllTo( /*target path*/ pathToDataFolder, /*overwrite*/ true);
    app.relaunch()
    app.exit()
}

// SETTINGS
exports.setUSBiface = (iface) => {
    settings.usbInterface.type = iface
    saveSettings()
    return settings
}
exports.setUSBport = (port) => {
    settings.usbInterface.port = port
    saveSettings()
    return settings
}

const listPorts = async() => {
    return new Promise(async(resolve, reject) => {
        SerialPort.list()
            .then(ports => resolve(ports))
            .catch(err => reject('Error listing ports', err))
    })
}

const interfaceIsConfigured = () => {
    if (settings.usbInterface.type === '' || settings.usbInterface.port === '') {
        console.log(("No interface specified in settings.config"))
        return false
    } else return true
}

const updatePorts = async() => {
    return new Promise(async(resolve, reject) => {
        const ports = await listPorts()
        if (JSON.stringify(this.serialPorts) !== JSON.stringify(ports)) {
            this.serialPorts = ports
            window.webContents.send('serialPorts', this.serialPorts)
            resolve(true)
        } else resolve(false)
    })

}

const ourPortIsAvailable = () => {
    const portIDX = this.serialPorts.findIndex(port => port.path === settings.usbInterface.port)
    if (portIDX >= 0) return true
    return false
}

const setConnectedStatus = (status) => {
    console.log("In Send Status", status)
    this.usbConnected = status
    window.webContents.send('usbConnection', status)
    if (!status) messenger.dccInterface = null
}

const doWeCareAboutThisUSBdevice = async() => {
    if (await updatePorts()) {
        // if we are already connected all we need to do is send new ports to window
        if (this.usbConnected) return
        console.log("USB not already connected")
        if (ourPortIsAvailable()) messenger.startInterface(settings.usbInterface, setConnectedStatus)
        else console.log("Didn't Find")
    }
}

const bootInterface = async() => {
    await updatePorts()
    if (!interfaceIsConfigured()) return
    if (ourPortIsAvailable()) messenger.startInterface(settings.usbInterface, setConnectedStatus)
    else console.log("Didn't Find")
}

const handleRemove = async() => {
    if (await updatePorts()) {
        if (!ourPortIsAvailable()) {
            setConnectedStatus(false)
        }
    }
}

bootInterface()

usb.on('attach', () => doWeCareAboutThisUSBdevice())
usb.on('detach', () => handleRemove())