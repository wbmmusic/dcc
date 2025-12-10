/**
 * Event Handler Types
 * 
 * This module defines type-safe event handlers for Electron IPC communication
 * and other asynchronous operations throughout the application.
 */

/**
 * Generic callback function for Electron IPC responses
 * 
 * @template T - The type of data expected in the callback
 * @param data - The data received from the Electron main process
 */
export type ElectronCallback<T = string | Record<string, unknown>> = (data: T) => void;

/**
 * Error callback function for handling Electron IPC errors
 * 
 * @param error - Error object or error message string
 */
export type ElectronErrorCallback = (error: Error | string) => void;

/**
 * Common pattern for operations that can succeed or fail
 * 
 * @interface ElectronInvokeHandlers
 * @property {ElectronCallback} [onSuccess] - Optional success callback
 * @property {ElectronErrorCallback} [onError] - Optional error callback
 */
export interface ElectronInvokeHandlers {
  onSuccess?: ElectronCallback;
  onError?: ElectronErrorCallback;
}

/**
 * Type-safe CSS text alignment values
 * 
 * @interface CSSTextAlign
 * @property {string} textAlign - Valid CSS text-align values
 */
export interface CSSTextAlign {
  textAlign: 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';
}