import React, { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';

import AppTop from "./components/AppTop";
import Updates from './components/Updates';

function App() {

  useEffect(() => {
    window.electron.receive('message', (theMessage) => {
      console.log(theMessage)
    })

    window.electron.receive('app_version', (arg) => {
      window.electron.removeListener('app_version');
      document.title = 'Big D\'s Railroad --- v' + arg.version;
    });

    window.electron.send('reactIsReady')

    return () => {
      window.electron.removeListener('reactIsReady')
    }
  }, [])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      userSelect: 'none',
      overflow: 'hidden'
    }}>
      <AppTop />
      <Updates />
    </div>
  );
}

export default App;
