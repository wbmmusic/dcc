import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import AppTop from "./components/AppTop";
import Updates from './components/Updates';
const { ipcRenderer } = window.require('electron')

function App() {

  useEffect(() => {
    ipcRenderer.on('message', (e, theMessage) => {
      console.log(theMessage)
    })

    ipcRenderer.on('app_version', (event, arg) => {
      ipcRenderer.removeAllListeners('app_version');
      document.title = 'Big D\'s Railroad --- v' + arg.version;
    });


    ipcRenderer.send('reactIsReady')

    return () => {
      ipcRenderer.removeAllListeners('reactIsReady')
    }
  }, [])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      userSelect: 'none',
      overflow: 'hidden'
    }}>
      <BrowserRouter>
        <AppTop />
        <Updates />
      </BrowserRouter>
    </div>
  );
}

export default App;
