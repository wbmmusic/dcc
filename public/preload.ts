/**
 * Electron Preload Script
 * 
 * Provides secure IPC communication bridge between the renderer process (React app)
 * and the main process (Node.js/Electron). This script runs in a privileged context
 * and exposes only the necessary APIs to the renderer for DCC operations.
 * 
 * Security: Uses contextBridge to safely expose APIs without giving full Node.js access
 */

import { contextBridge, ipcRenderer } from 'electron';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

/**
 * Expose secure Electron APIs to the renderer process
 * 
 * These APIs provide controlled access to:
 * - IPC communication for DCC commands
 * - Window identification for throttle windows
 * - UUID generation for database records
 * - Path utilities for file operations
 */
contextBridge.exposeInMainWorld('electron', {
    /**
     * Gets the unique window ID for throttle windows
     * Used to identify which locomotive a throttle window controls
     * @returns {string|null} Window ID or null if not a throttle window
     */
    getWindowID: () => {
        let idArgIdx = window.process.argv.findIndex(arg => arg.includes('--windowID:'))
        if (idArgIdx >= 0) return window.process.argv[idArgIdx].split(':')[1]
        else return null
    },
    
    /**
     * Generate unique identifiers for database records
     */
    uuid: uuid,
    
    /**
     * Send command to main process and wait for response
     * Used for DCC commands, database operations, file I/O
     */
    invoke: (a: string, b?: any, c?: any, d?: any) => ipcRenderer.invoke(a, b, c, d),
    
    /**
     * Send one-way message to main process
     * Used for fire-and-forget operations like emergency stops
     */
    send: (channel: string, args?: any) => ipcRenderer.send(channel, args),
    
    /**
     * Listen for messages from main process
     * Used for real-time updates like locomotive status changes
     */
    receive: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    
    /**
     * Remove message listeners for cleanup
     */
    removeListener: (channel: string) => ipcRenderer.removeAllListeners(channel),
    
    /**
     * Path joining utility for file operations
     */
    join: join
})