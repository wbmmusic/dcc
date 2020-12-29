const { app, BrowserWindow, ipcMain, globalShortcut, Menu, dialog, protocol } = require('electron')
const path = require('path')
const url = require('url')
const SerialPort = require('serialport')

var fs = require('fs');

const { autoUpdater } = require('electron-updater');

const isMac = process.platform === 'darwin'

let pathToAssets = path.join('C:', 'ProgramData', 'WBM Tek', 'dcc')
let pathToLocos = path.join('C:', 'ProgramData', 'WBM Tek', 'dcc', 'locos')

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

if (!fs.existsSync(path.join(pathToLocos, 'locos.json'))) {
  console.log('File doesnt exist')
  fs.mkdirSync(pathToLocos, { recursive: true })
  fs.writeFileSync(path.join(pathToLocos, 'locos.json'), JSON.stringify(defaultLocosData))
} else {
  console.log('Found Locos File')
}

const locosFile = () => {
  let tempFile = JSON.parse(fs.readFileSync(path.join(pathToLocos, 'locos.json')))
  return tempFile
}

const saveLocosFile = (fileData) => {
  console.log('Save Locos File')
  fs.writeFileSync(path.join(pathToLocos, 'locos.json'), JSON.stringify(fileData))
}

const makeLocos = () => {
  locos = locosFile().locos
}



makeLocos()
//console.log(locos)

function writeAndDrain() {
  if (!sending) {
    sending = true
    port.write(outBuffer[0])
    outBuffer = outBuffer.slice(1)
    port.drain(party())
  }
}

function party() {

  //console.log('In Party')
  setTimeout(() => {
    if (outBuffer.length > 0) {
      sending = false
      writeAndDrain()
    } else {
      sending = false
    }
  }, 40);
}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 950,
    height: 750,
    icon: __dirname + '/icon.ico',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  })

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  win.loadURL(startUrl);


  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
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
      autoUpdater.on('update-downloaded', (e, updateInfo, f, g) => { win.webContents.send('updateDownloaded', e) })
      autoUpdater.on('download-progress', (e) => { win.webContents.send('updateDownloadProgress', e.percent) })
      autoUpdater.on('error', (e, message) => win.webContents.send('updateError', message))

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
  port.on('error', function (err) {
    console.log('Error: ', err.message)
    //NOTIFY DENNIS HERE
  })
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
        var theName = path.basename(result.filePaths[0])

        fs.copyFile(result.filePaths[0], 'src/locos/' + path.basename(result.filePaths[0]), (err) => {
          if (err) throw err;
          console.log('source.txt was copied to destination.txt');
        });


        event.reply('hereIsYourImage', theName)
      }
    }).catch(err => {
      console.log(err)
    })
  })
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

function listPorts() {
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