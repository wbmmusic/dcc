const { app, BrowserWindow, ipcMain, globalShortcut, Menu, dialog, protocol } = require('electron')
const { join, basename, normalize } = require('path')
const url = require('url')
const SerialPort = require('serialport')
const { autoUpdater } = require('electron-updater');
var fs = require('fs');

const { config, newDecoder, deleteDecoder, getDecoderByID, updateDecoder, pathToImages, newLoco, deleteLoco, getLocoByID } = require('./utilities');
const { throttles } = require('./throttles');

const isMac = process.platform === 'darwin'

let pathToLocos = join('C:', 'ProgramData', 'WBM Tek', 'dcc', 'locos')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let port
let outBuffer = []
let sending = false
let locos = []

let defaultLocosData = {
  locos: []
}

if (!fs.existsSync(join(pathToLocos, 'locos.json'))) {
  console.log('File doesn\'t exist')
  fs.mkdirSync(pathToLocos, { recursive: true })
  fs.writeFileSync(join(pathToLocos, 'locos.json'), JSON.stringify(defaultLocosData))
} else {
  console.log('Found Locos File')
}

if (!fs.existsSync(join(pathToLocos, 'images', 'default.jpg'))) {
  console.log('Default Loco image doesn\'t exist')
  fs.mkdirSync(join(pathToLocos, 'images'), { recursive: true })
  fs.copyFileSync(join(__dirname, 'default.jpg'), join(pathToLocos, 'images', 'default.jpg'))
} else {
  console.log('Found Default Loco image')
}

const locosFile = () => {
  let tempFile = JSON.parse(fs.readFileSync(join(pathToLocos, 'locos.json')))
  return tempFile
}

const saveLocosFile = (fileData) => {
  console.log('Save Locos File')
  fs.writeFileSync(join(pathToLocos, 'locos.json'), JSON.stringify(fileData))
}

const makeLocos = () => {
  locos = locosFile().locos
}

console.log('Delete Me')

makeLocos()
//console.log(locos)



const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 950,
    height: 750,
    icon: __dirname + '/icon.ico',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  })

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  win.loadURL(startUrl);


  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })

  win.on('ready-to-show', () => win.show())
}

const createThrottleWindow = () => {
  // Create the browser window.
  throttles[0] = new BrowserWindow({
    width: 250,
    height: 500,
    icon: __dirname + '/icon.ico',
    autoHideMenuBar: true,
    show: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  })

  const startUrl = process.env.ELECTRON_START_URL + "#/modal/throttle" || url.format({
    pathname: join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  }) + '#/modal/throttle';
  throttles[0].loadURL(startUrl);


  // Emitted when the window is closed.
  throttles[0].on('closed', () => {
    throttles[0] = null
  })

  throttles[0].on("ready-to-show", () => {
    console.log("READY TO SHOW POPUP")
    throttles[0].show()
  })
}

app.on('ready', () => {

  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });

  ipcMain.on('reactIsReady', () => {

    console.log('React Is Ready')
    win.webContents.send('message', 'React Is Ready')
    win.webContents.send('app_version', { version: app.getVersion() });

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
  listPorts()
  port = new SerialPort('COM16', { baudRate: 9600 })
  port.on('error', (err) => {
    console.log('USB Error: ', err.message)
    //NOTIFY DENNIS HERE
  })

  port.on('readable', (data) => {
    console.log('USB received readable:')
    console.log(data)
  })

  port.on('data', (data) => {
    console.log('USB received data: ', data)
  })

  const writeAndDrain = () => {
    if (!sending) {
      sending = true
      port.write(outBuffer[0])
      outBuffer = outBuffer.slice(1)
      port.drain(party())
    }
  }

  const party = () => {
    //console.log('In Party')
    setTimeout(() => {
      if (outBuffer.length > 0) {
        sending = false
        writeAndDrain()
      } else {
        sending = false
      }
    }, 50);
  }
  //console.log(port)

  const eStopAllQuickKey = globalShortcut.register('Ctrl+space', () => {
    console.log('SPACE PRESS')
    win.webContents.send('eStopAll');
  })

  const eStopSelectedQuickKey = globalShortcut.register('shift+space', () => {
    console.log('SHIFT SPACE PRESS')
    win.webContents.send('eStopSelected');
  })

  ipcMain.on('getLocos', () => {
    win.webContents.send('locos', locos)
  })

  ipcMain.on('send-serial', (event, arg) => {
    //console.log('send-serial')
    //console.log(arg)
    outBuffer.push(arg)
    writeAndDrain()
    //port.write(arg)
  })

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

        fs.copyFile(result.filePaths[0], 'src/locos/' + basename(result.filePaths[0]), (err) => {
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
    return file
  })
  ipcMain.handle('createLoco', (e, loco) => {
    return newLoco(loco)
  })
  ipcMain.handle('deleteLocomotive', (e, id) => deleteLoco(id))
  ipcMain.handle('getLocomotiveById', (e, id) => getLocoByID(id))
  ipcMain.on('newThrottle', () => createThrottleWindow())

})

app.whenReady().then(() => {
  protocol.registerFileProtocol('loco', (request, callback) => {
    const url = request.url.substr(6)
    console.log(url)
    callback({ path: normalize(`${pathToImages}/${url}`) })
  })

  protocol.registerFileProtocol('atom', (request, callback) => {
    const url = request.url.substr(6)
    console.log(url)
    callback({ path: normalize(`${pathToLocos}/images/${url}`) })
  })

  console.log("THROTTLES", throttles)
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    port.close()
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

const listPorts = () => {
  console.log('PORTLIST')
  SerialPort.list().then(
    ports => {
      ports.forEach(port => {
        console.log(`${port.path}\t${port.pnpId || ''}\t${port.manufacturer || ''}`)
        console.log(port)
      })
    },
    err => {
      console.error('Error listing ports', err)
    }
  )
}

// MENU
const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    label: 'Locomotives',
    submenu: [
      { label: 'Something Here' },
      { type: 'separator' },
      {
        label: 'Add Loco',
        click: async () => {
          win.webContents.send('addLoco')
        }
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)