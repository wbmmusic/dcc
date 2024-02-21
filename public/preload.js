const { contextBridge, ipcRenderer } = require('electron')
const { join } = require('path')
const { v4: uuid } = require('uuid');


contextBridge.exposeInMainWorld('electron', {
    getWindowID: () => {
        let idArgIdx = window.process.argv.findIndex(arg => arg.includes('--windowID:'))
        if (idArgIdx >= 0) return window.process.argv[idArgIdx].split(':')[1]
        else return null
    },
    uuid: uuid,
    invoke: (a, b, c, d) => ipcRenderer.invoke(a, b, c, d),
    send: (channel, args) => ipcRenderer.send(channel, args),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    removeListener: (channel) => ipcRenderer.removeAllListeners(channel),
    join: join
})