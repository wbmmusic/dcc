/**
 * Event Handler Parameter Types
 * 
 * This module defines type-safe parameter types for various event handlers
 * used throughout the React components and Electron communication.
 */

/**
 * Success handler for Electron IPC operations
 * 
 * @template T - The type of result data expected
 * @param result - The successful result from the Electron main process
 */
export type ElectronSuccessHandler<T = string | Record<string, unknown>> = (result: T) => void;

/**
 * Error handler for Electron IPC operations
 * 
 * @param error - Error object or error message string from the main process
 */
export type ElectronErrorHandler = (error: Error | string) => void;

/**
 * React input change event handler
 * 
 * @param event - React change event for HTML input elements
 */
export type ChangeEventHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;

/**
 * React mouse click event handler
 * 
 * @param event - React mouse event for clickable elements
 */
export type ClickEventHandler = (event: React.MouseEvent) => void;

/**
 * React keyboard event handler
 * 
 * @param event - React keyboard event for key press handling
 */
export type KeyEventHandler = (event: React.KeyboardEvent) => void;