import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import AppTop from "./components/AppTop";
const { ipcRenderer } = window.require('electron')

function App() {

  useEffect(() => {
    ipcRenderer.on('message', (e, theMessage) => {
      console.log(theMessage)
    })

    ipcRenderer.on('app_version', (event, arg) => {
      ipcRenderer.removeAllListeners('app_version');
      document.title = 'Electron Test Yo --- v' + arg.version;
    });


    ipcRenderer.send('reactIsReady')

    return () => {
      ipcRenderer.removeListener('reactIsReady')
    }
  }, [])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      userSelect: 'none'
    }}>
      <BrowserRouter>
        <AppTop />
      </BrowserRouter>
    </div>
  );
}

export default App;
