const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron')
const { join, normalize, parse } = require('path')
const { format } = require('url')
const { autoUpdater } = require('electron-updater');
const { copyFileSync } = require('fs');
const util = require('./utilities');
const { Locomotive } = require('./locomotive');
const { Switch } = require('./switches');
const { Accessory } = require('./accessory');
const { setCV, getProgrammingTrackStatus, enableProgrammingTrack, disableProgrammingTrack, readCvPrg } = require('./messenger')

let win
let port
let locoObjects = []
let switchObjects = []
let accessoryObjects = []

// Nothing


// SECOND INSTANCE
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) app.quit()
else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
        }
    })
}
// END SECOND INSTANCE


const createWindow = () => {
    // Create the browser window.
    win = new BrowserWindow({
        width: 950,
        height: 750,
        icon: __dirname + '/icon.ico',
        autoHideMenuBar: true,
        show: false,
        title: 'Big D\'s Railroad v' + app.getVersion(),
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            sandbox: false,
            webSecurity: false
        }
    })

    const startUrl = process.env.ELECTRON_START_URL || format({
        pathname: join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    win.loadURL(startUrl);


    // Emitted when the window is closed.
    win.on('closed', () => app.quit())
    win.on('ready-to-show', () => win.show())

    util.setWindow(win)
}

const checkIfAllThrottlesAreClosed = () => {
    console.log("IN DIS")
    let allAreClosed = true

    locoObjects.forEach(loco => {
        if (loco.window !== null) allAreClosed = false
    })

    if (!allAreClosed) win.webContents.send('throttlesClosed')
}

app.whenReady().then(() => {
    // Register protocols before creating windows
    protocol.registerFileProtocol('loco', (request, callback) => {
        const fileName = request.url.replace('loco://', '')
        const imagePath = normalize(`${util.pathToImages}/${fileName}`)
        console.log('Protocol request:', request.url, '-> Path:', imagePath)
        callback({ path: imagePath })
    })

    protocol.registerFileProtocol('aimg', (request, callback) => {
        callback({ path: normalize(`${util.pathToAppImages}/${request.url.substring(7)}`) })
    })

    ipcMain.on('reactIsReady', () => {
        //console.log('React Is Ready')
        win.webContents.send('message', 'React Is Ready')

        if (app.isPackaged) {
            win.webContents.send('message', 'App is packaged')

            autoUpdater.on('error', (err) => win.webContents.send('updater', err))
            autoUpdater.on('checking-for-update', () => win.webContents.send('updater', "checking-for-update"))
            autoUpdater.on('update-available', (info) => win.webContents.send('updater', 'update-available', info))
            autoUpdater.on('update-not-available', (info) => win.webContents.send('updater', 'update-not-available', info))
            autoUpdater.on('download-progress', (info) => win.webContents.send('updater', 'download-progress', info))
            autoUpdater.on('update-downloaded', (info) => win.webContents.send('updater', 'update-downloaded', info))

            ipcMain.on('installUpdate', () => autoUpdater.quitAndInstall())

            setTimeout(() => autoUpdater.checkForUpdates(), 3000);
            setInterval(() => autoUpdater.checkForUpdates(), 1000 * 60 * 60);
        }

    })

    createWindow()

    const setSwitch = (id, action) => {
        const switchIDX = switchObjects.findIndex(swh => swh.id === id)
        if (switchIDX < 0) throw new Error('Error in setSwitch')
        if (action === 'open') return switchObjects[switchIDX].switch.open()
        else if (action === 'close') return switchObjects[switchIDX].switch.close()
        else if (action === 'toggle') return switchObjects[switchIDX].switch.toggle()
    }

    const handleMacro = (idx) => {
        console.log("Handle Macro", idx)
        if (util.config.macros[idx] === undefined) return new Error('Invalid Macro Index')
        let actions = util.config.macros[idx].actions
        actions.forEach(act => { setSwitch(act.switch, act.state) })
    }

    // CONSISTS
    ipcMain.handle('getConsists', () => util.config.consists)
    ipcMain.handle('createConsist', (e, newConsist) => util.createConsist(newConsist))
    ipcMain.handle('getConsistByID', (e, id) => util.getConsistById(id))
    ipcMain.handle('updateConsist', (e, updatedConsist) => util.updateConsist(updatedConsist))
    ipcMain.handle('deleteConsist', (e, id) => util.deleteConsist(id))
    ipcMain.handle('toggleConsist', (e, id) => util.toggleConsist(id))

    // DECODERS
    ipcMain.handle('getDecoders', () => util.config.decoders)
    ipcMain.handle('createDecoder', (e, decoder) => util.newDecoder(decoder))
    ipcMain.handle('deleteDecoder', (e, decoderID) => util.deleteDecoder(decoderID))
    ipcMain.handle('getDecoderById', (e, id) => util.getDecoderByID(id))
    ipcMain.handle('updateDecoder', (e, updatedDecoder) => util.updateDecoder(updatedDecoder))


    // SWITCHES
    ipcMain.handle('getSwitches', () => {
        let out = []
        switchObjects.forEach(swh => out.push({ _id: swh.switch._id, name: swh.switch.name, state: swh.switch.state }))
        return out
    })
    ipcMain.handle('createSwitch', (e, newSwitch) => util.createSwitch(newSwitch))
    ipcMain.handle('getSwitchByID', (e, id) => util.getSwitchByID(id))
    ipcMain.handle('updateSwitch', (e, editedSwitch) => util.updateSwitch(editedSwitch))


    // LOCOS
    ipcMain.handle('getLocomotives', () => util.config.locos)
    ipcMain.handle('selectLocoImage', async () => {
        let file = await dialog.showOpenDialog(win, {
            filters: [{
                name: 'Images',
                extensions: ['jpg', 'jpeg', 'bmp', 'png', 'tiff']
            }],
        })
        if (!file.canceled) {
            copyFileSync(file.filePaths[0], join(util.pathToImages, parse(file.filePaths[0]).base))
            return parse(file.filePaths[0]).base
        } else return "canceled"

    })
    ipcMain.handle('createLoco', (e, loco) => util.newLoco(loco))
    ipcMain.handle('updateLocomotive', (e, editedLoco) => util.updateLoco(editedLoco))
    ipcMain.handle('deleteLocomotive', (e, id) => util.deleteLoco(id))
    ipcMain.handle('getLocomotiveById', (e, id) => util.getLocoByID(id))

    // THROTTLES
    ipcMain.handle('mainWindowThrottle', (e, locoIdx, action, data) => {
        const res = locoObjects[locoIdx].loco.handleThrottleCommand(action, data)
        if (locoObjects[locoIdx].loco.window !== null) locoObjects[locoIdx].loco.window.webContents.send('modalThrottleUpdate')
        return res
    })
    ipcMain.on('newThrottle', (e, id) => {
        console.log("NEW THROTTLE")
        const locoIdx = locoObjects.findIndex(loco => loco.id === id)
        if (locoIdx >= 0) {
            locoObjects[locoIdx].loco.showThrottle(win, locoIdx)
            win.webContents.send('throttlesOpen')
        } else return new Error("THROTTLE ERROR")
    })
    ipcMain.on('closeThrottles', () => {
        locoObjects.forEach(obj => {
            if (obj.loco.window !== null) obj.loco.closeThrottle()
        })
        checkIfAllThrottlesAreClosed()
    })


    // SETTINGS
    ipcMain.handle('getSettings', () => util.settings)
    ipcMain.handle('setUSBiface', (e, iface) => util.setUSBiface(iface))
    ipcMain.handle('setUSBport', (e, port) => util.setUSBport(port))


    // SerialPorts
    ipcMain.handle('getSerialPorts', () => util.serialPorts)
    ipcMain.handle('getUsbConnection', () => util.usbConnected)

    // CONFIG
    ipcMain.on('backupConfig', async () => {
        let file = await dialog.showSaveDialog(win, {
            title: 'Backup config to file',
            filters: [{
                name: 'dccConfig',
                extensions: ['dccConfig']
            }],
        })
        if (!file.canceled) {

            try {
                let zip = await util.backupConfig(file.filePath)
                console.log(zip)
            } catch (error) {
                throw error
            }
        } else return "canceled"
    })
    ipcMain.on('restoreConfig', async () => {
        let file = await dialog.showOpenDialog(win, {
            title: 'Restore from file',
            filters: [{
                name: 'dccConfig',
                extensions: ['dccConfig']
            }],
        })
        if (!file.canceled) {
            util.restoreConfig(file.filePaths[0])
        } else return "canceled"
    })

    //CVs
    ipcMain.handle('setCV', (e, address, cv, value) => setCV(address, cv, value))


    // MACROS
    ipcMain.handle('getMacros', () => util.config.macros)
    ipcMain.handle('createMacro', (e, newMacro) => util.createMacro(newMacro))
    ipcMain.handle('updateMacro', (e, editedMacro) => util.updateMacro(editedMacro))
    ipcMain.handle('getMacroByID', (e, id) => util.getMacroByID(id))
    ipcMain.handle('fireMacro', (e, macroNumber) => handleMacro(macroNumber))


    // PROGRAMMING TRACK
    ipcMain.handle('getProgrammingTrackStatus', () => getProgrammingTrackStatus())
    ipcMain.handle('setProgrammingTrack', async (e, state) => {
        if (!util.usbConnected) return false
        if (getProgrammingTrackStatus() === state) return state
        if (state) return await enableProgrammingTrack()
        else return await disableProgrammingTrack()
    })
    ipcMain.handle('readCvPrg', async (e, cv) => await readCvPrg(cv))


    // ACCESSORIES
    ipcMain.handle('getAccessories', () => util.config.accessories)
    ipcMain.handle('createAccessory', (e, newAcc) => util.createAccessory(newAcc))
    ipcMain.handle('updateAccessory', (e, editedAcc) => util.updateAccessory(editedAcc))
    ipcMain.handle('getAccessoryByID', (e, id) => util.getAccessoryByID(id))

    const getAccessoryActions = () => {
        let out = []
        accessoryObjects.forEach(acc => {
            acc.accessory.device.actions.forEach((act, idx) => {
                if (act.name !== '') out.push({ action: acc.accessory._id, idx: idx, ...act })
            })
        })
        return out
    }

    ipcMain.handle('getAccessoryActions', () => getAccessoryActions())
    ipcMain.handle('accessoryAction', (e, data) => {
        const accIDX = accessoryObjects.findIndex(acc => acc.id === data.id)
        console.log("INDEX", accIDX)
        console.log("OBJECTS", accessoryObjects)
        if (accIDX < 0) return new Error("Error in ipc handle accessoryAction")
        console.log(accessoryObjects[accIDX])
        accessoryObjects[accIDX].accessory.toggleFunction(accessoryObjects[accIDX].accessory.address, data.idx)
        return getAccessoryActions()
    })

    ipcMain.handle('toggleAcc', () => accessoryObjects[0].accessory.toggleFunction(5, 0))

    ipcMain.handle('setSwitch', (e, id, action) => setSwitch(id, action))




    // IMPORTANT /////////////////////////////////////////////////////////////////////////////////////////////////
    util.config.locos.forEach(loco => locoObjects.push({ id: loco._id, loco: new Locomotive({ loco: loco }) }))
    util.config.switches.forEach(switchh => switchObjects.push({ id: switchh._id, switch: new Switch({ ...switchh }) }))
    util.config.accessories.forEach(acc => accessoryObjects.push({ id: acc._id, accessory: new Accessory({ ...acc }) }))


    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        port.close()
        app.quit()
    }
})