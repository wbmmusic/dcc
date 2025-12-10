import React, { useEffect } from 'react';

import AppTop from "./components/AppTop.jsx";
import Updates from './components/Updates.jsx';

function App() {

  useEffect(() => {
    window.electron.receive('message', (theMessage) => console.log(theMessage))
    window.electron.send('reactIsReady')

    return () => window.electron.removeListener('reactIsReady')
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
