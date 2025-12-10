/**
 * Electron Squirrel Startup Type Declaration
 * 
 * Type definition for the electron-squirrel-startup module which handles
 * Windows installer events during application startup. This module returns
 * true if the app should quit immediately due to Squirrel installer operations.
 * 
 * Used to prevent the main application from starting during Windows installer
 * operations like install, uninstall, or update processes.
 */
declare module 'electron-squirrel-startup' {
  const squirrelStartup: boolean;
  export = squirrelStartup;
}