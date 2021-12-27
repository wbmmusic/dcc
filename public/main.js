const { app, BrowserWindow, ipcMain, globalShortcut, dialog, protocol } = require('electron')
const { join, basename, normalize, parse } = require('path')
const { format } = require('url')
const { autoUpdater } = require('electron-updater');
const { copyFileSync } = require('fs');
const { config, newDecoder, deleteDecoder, getDecoderByID, updateDecoder, pathToImages, newLoco, deleteLoco, getLocoByID, updateLoco } = require('./utilities');
const { Locomotive } = require('./locomotive');
const { sendAsyncSignal } = require('./messenger');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let port
let locos = []
let locoObjects = []


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

  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });

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

  ipcMain.on('getLocos', () => win.webContents.send('locos', locos))

  ipcMain.on('addLoco', (event, arg) => {
    console.log('got an add loco')
    console.log(arg)
    //port.write(arg)
  })

  ipcMain.on('chooseImage', (event) => {
    dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'Image File', extensions: ['png', 'jpg', 'jpeg', 'tiff', 'bmp'] },
      ]
    }).then(result => {
      if (result.canceled) {
        console.log('CANCLED')
      } else {
        console.log(result.filePaths[0])
        var theName = basename(result.filePaths[0])

        copyFileSync(result.filePaths[0], 'src/locos/' + basename(result.filePaths[0]), (err) => {
          if (err) throw err;
          console.log('source.txt was copied to destination.txt');
        });


        event.reply('hereIsYourImage', theName)
      }
    }).catch(err => {
      console.log(err)
    })
  })

  ipcMain.handle('getConsists', () => config.consists)

  // DECODERS
  ipcMain.handle('getDecoders', () => config.decoders)
  ipcMain.handle('createDecoder', (e, decoder) => {
    newDecoder(decoder)
    return "Created"
  })
  ipcMain.handle('deleteDecoder', (e, decoderID) => deleteDecoder(decoderID))
  ipcMain.handle('getDecoderById', (e, id) => getDecoderByID(id))
  ipcMain.handle('updateDecoder', (e, updatedDecoder) => updateDecoder(updatedDecoder)
  )

  // LOCOS
  ipcMain.handle('getLocomotives', () => config.locos)
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
      copyFileSync(file.filePaths[0], join(pathToImages, parse(file.filePaths[0]).base))
      return parse(file.filePaths[0]).base
    } else return "canceled"

  })
  ipcMain.handle('createLoco', (e, loco) => newLoco(loco))
  ipcMain.handle('updateLocomotive', (e, editedLoco) => updateLoco(editedLoco))
  ipcMain.handle('deleteLocomotive', (e, id) => deleteLoco(id))
  ipcMain.handle('getLocomotiveById', (e, id) => getLocoByID(id))

  ipcMain.on('newThrottle', (e, id) => {
    console.log("NEW THROTTLE")
    const locoIdx = locoObjects.findIndex(loco => loco.id === id)
    if (locoIdx >= 0) {
      locoObjects[locoIdx].loco.showThrottle()
    } else console.log("THROTTLE ERROR")
  })

  ipcMain.on('closeThrottles', () => {
    locoObjects.forEach(obj => {
      if (obj.loco.window !== null) obj.loco.closeThrottle()
    })
  })


  ipcMain.handle('setSwitch', () => sendAsyncSignal(3, 3, 0))

})

app.whenReady().then(() => {
  protocol.registerFileProtocol('loco', (request, callback) => {
    const url = request.url.substr(6)
    //console.log(url)
    callback({ path: normalize(`${pathToImages}/${url}`) })
  })

  config.locos.forEach(loco => locoObjects.push({ id: loco._id, loco: new Locomotive({ loco: loco }) }))

  locoObjects.forEach(loco => console.log(loco.loco.info()))
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    port.close()
    app.quit()
  }
})

app.on('activate', () => { if (win === null) { createWindow() } })