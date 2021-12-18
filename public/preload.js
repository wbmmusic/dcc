const { contextBridge, ipcRenderer } = require('electron')
const { join } = require('path')

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: ipcRenderer,
    send: (channel, args) => ipcRenderer.send(channel, args),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    removeListener: (channel) => ipcRenderer.removeAllListeners(channel),
    join: join
})