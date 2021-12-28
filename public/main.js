const { app, BrowserWindow, ipcMain, globalShortcut, dialog, protocol } = require('electron')
const { join, normalize, parse } = require('path')
const { format } = require('url')
const { autoUpdater } = require('electron-updater');
const { copyFileSync } = require('fs');
const util = require('./utilities');
const { Locomotive } = require('./locomotive');
const { Switch } = require('./switches');
const { config } = require('process');
const { Accessory } = require('./accessory');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let port
let locoObjects = []
let switchObjects = []
let accessoryObjects = []


const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 950,
    height: 750,
    icon: __dirname + '/icon.ico',
    autoHideMenuBar: true,
    show: false,
    title: 'Big D\'s Railroad --- v' + app.getVersion(),
    webPreferences: {
      preload: join(__dirname, 'preload.js')
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
}

app.on('ready', () => {

  ipcMain.on('reactIsReady', () => {
    //console.log('React Is Ready')
    win.webContents.send('message', 'React Is Ready')

    if (app.isPackaged) {
      win.webContents.send('message', 'App is packaged')

      ipcMain.on('installUpdate', () => {
        autoUpdater.quitAndInstall(true, true)
      })

      autoUpdater.on('checking-for-update', () => win.webContents.send('checkingForUpdates'))
      autoUpdater.on('update-available', () => win.webContents.send('updateAvailable'))
      autoUpdater.on('update-not-available', () => win.webContents.send('noUpdate'))
      autoUpdater.on('update-downloaded', (updateInfo, f, g) => { win.webContents.send('updateDownloaded', updateInfo) })
      autoUpdater.on('download-progress', (e) => { win.webContents.send('updateDownloadProgress', e.percent) })
      autoUpdater.on('error', (message) => win.webContents.send('updateError', message))

      setInterval(() => {
        win.webContents.send('message', 'Interval')
        autoUpdater.checkForUpdatesAndNotify()
      }, 600000);

      autoUpdater.checkForUpdatesAndNotify()
    }

  })

  createWindow()

  //console.log(port)

  const eStopAllQuickKey = globalShortcut.register('Ctrl+space', () => {
    console.log('SPACE PRESS')
    win.webContents.send('eStopAll');
  })

  const eStopSelectedQuickKey = globalShortcut.register('shift+space', () => {
    console.log('SHIFT SPACE PRESS')
    win.webContents.send('eStopSelected');
  })

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

  // DECODERS
  ipcMain.handle('getDecoders', () => util.config.decoders)
  ipcMain.handle('createDecoder', (e, decoder) => {
    util.newDecoder(decoder)
    return "Created"
  })
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
      filters: [
        {
          name: 'Images',
          extensions: ['jpg', 'jpeg', 'bmp', 'png', 'tiff']
        }
      ],
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
  ipcMain.on('newThrottle', (e, id) => {
    console.log("NEW THROTTLE")
    const locoIdx = locoObjects.findIndex(loco => loco.id === id)
    if (locoIdx >= 0) {
      locoObjects[locoIdx].loco.showThrottle()
    } else console.log("THROTTLE ERROR")
  })
  ipcMain.handle('mainWindowThrottle', (e, locoIdx, action, data) => locoObjects[locoIdx].loco.handleThrottleCommand(action, data))
  ipcMain.on('closeThrottles', () => {
    locoObjects.forEach(obj => {
      if (obj.loco.window !== null) obj.loco.closeThrottle()
    })
  })


  // MACROS
  ipcMain.handle('getMacros', () => util.config.macros)
  ipcMain.handle('createMacro', (e, newMacro) => util.createMacro(newMacro))
  ipcMain.handle('updateMacro', (e, editedMacro) => util.updateMacro(editedMacro))
  ipcMain.handle('getMacroByID', (e, id) => util.getMacroByID(id))

  ipcMain.handle('fireMacro', (e, macroNumber) => handleMacro(macroNumber)
  )


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


  ipcMain.handle('setSwitch', (e, id, action) => {
    console.log("Set Switch", action)
    return setSwitch(id, action)
  })

})

app.whenReady().then(() => {
  protocol.registerFileProtocol('loco', (request, callback) => {
    callback({ path: normalize(`${util.pathToImages}/${request.url.substr(6)}`) })
  })

  // IMPORTANT /////////////////////////////////////////////////////////////////////////////////////////////////
  util.config.locos.forEach(loco => locoObjects.push({ id: loco._id, loco: new Locomotive({ loco: loco }) }))
  util.config.switches.forEach(switchh => switchObjects.push({ id: switchh._id, switch: new Switch({ ...switchh }) }))
  util.config.accessories.forEach(acc => accessoryObjects.push({ id: acc._id, accessory: new Accessory({ ...acc }) }))
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    port.close()
    app.quit()
  }
})

app.on('activate', () => { if (win === null) { createWindow() } })