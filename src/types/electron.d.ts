/**
 * Electron API Interface
 * 
 * Defines the IPC (Inter-Process Communication) methods available to the renderer
 * process for communicating with the Electron main process. These methods provide
 * secure communication for DCC commands, file operations, and system interactions.
 */
interface ElectronAPI {
  /**
   * Send a one-way message to the main process
   * Used for fire-and-forget operations like emergency stops
   * @param channel - IPC channel name
   * @param args - Arguments to send with the message
   */
  send: (channel: string, ...args: (string | number | boolean | Record<string, unknown>)[]) => void;
  
  /**
   * Register a listener for messages from the main process
   * Used for real-time updates like locomotive status changes
   * @param channel - IPC channel name to listen on
   * @param callback - Function to call when message is received
   */
  receive: (channel: string, callback: (data: string | Record<string, unknown>) => void) => void;
  
  /**
   * Send a message and wait for a response from the main process
   * Used for DCC commands, database operations, and file I/O
   * @param channel - IPC channel name
   * @param args - Arguments to send with the request
   * @returns Promise that resolves with the response data
   */
  invoke: (channel: string, ...args: (string | number | boolean | Record<string, unknown>)[]) => Promise<string | number | boolean | Record<string, unknown> | null>;
  
  /**
   * Remove a previously registered message listener
   * Used for cleanup when components unmount
   * @param channel - IPC channel name to stop listening on
   */
  removeListener: (channel: string) => void;
  
  /**
   * Generate a unique identifier string
   * Used for creating new database record IDs
   * @returns A unique UUID string
   */
  uuid: () => string;
  
  /**
   * Get the unique window ID for throttle windows
   * Used to identify which locomotive a throttle window controls
   * @returns Window ID or null if not a throttle window
   */
  getWindowID: () => string | null;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};