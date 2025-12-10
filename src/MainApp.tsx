/**
 * Main Application Component
 * 
 * This is the root component of Big D's Railroad DCC control application.
 * It initializes the Electron IPC communication and renders the main interface
 * components including the locomotive control interface and update system.
 */

import React, { useEffect } from 'react';

import AppTop from "./components/AppTop";
import Updates from './components/Updates';

/**
 * Root application component that sets up the DCC control interface
 * 
 * Responsibilities:
 * - Initialize Electron IPC communication with the main process
 * - Set up message listeners for system notifications
 * - Render the main application layout with locomotive controls
 * - Handle application-wide updates
 * 
 * @returns {React.JSX.Element} The complete application interface
 */
function App(): React.JSX.Element {

  useEffect(() => {
    // Set up IPC message listener for system notifications and debug messages
    window.electron.receive('message', (theMessage: string | Record<string, unknown>) => console.log(theMessage))
    
    // Notify the main process that React is ready to receive commands
    window.electron.send('reactIsReady')

    // Cleanup: Remove the message listener when component unmounts
    return () => window.electron.removeListener('reactIsReady')
  }, [])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      userSelect: 'none', // Prevent text selection for a more app-like feel
      overflow: 'hidden'  // Prevent scrollbars on the main container
    }}>
      {/* Main locomotive control interface */}
      <AppTop />
      
      {/* Auto-update system for seamless software updates */}
      <Updates />
    </div>
  );
}

export default App;
