/**
 * Big D's Railroad - Main Electron Process
 * 
 * Clean bootstrap using service-oriented architecture.
 * All business logic moved to dedicated services.
 */

import { app, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { DCCApplication } from './DCCApplication.js'
import squirrelStartup from 'electron-squirrel-startup'

// Handle Squirrel installer events on Windows
if (squirrelStartup) app.quit()

// Create and start application
try {
    const dccApp = new DCCApplication()
    dccApp.start().catch(error => {
        console.error('Failed to start DCC application:', error)
        app.quit()
    })
} catch (error) {
    console.error('Failed to initialize DCC application:', error)
    app.quit()
}

// Setup auto-updater if packaged
app.whenReady().then(() => {
    ipcMain.on('reactIsReady', () => {
        if (app.isPackaged) {
            // Auto-updater setup
            autoUpdater.on('error', (err) => console.error('Updater error:', err instanceof Error ? err.message : 'Unknown error'))
            autoUpdater.on('checking-for-update', () => console.log('Checking for updates...'))
            autoUpdater.on('update-available', (info) => console.log('Update available:', info ? 'Yes' : 'No'))
            autoUpdater.on('update-not-available', (info) => console.log('No updates available'))
            autoUpdater.on('download-progress', (info) => console.log('Download progress:', info?.percent ? `${Math.round(info.percent)}%` : 'Unknown'))
            autoUpdater.on('update-downloaded', (info) => console.log('Update downloaded successfully'))

            ipcMain.on('installUpdate', () => autoUpdater.quitAndInstall())

            setTimeout(() => autoUpdater.checkForUpdates(), 3000)
            setInterval(() => autoUpdater.checkForUpdates(), 1000 * 60 * 60)
        }
    })
})
