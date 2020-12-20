import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AppTop from "./components/AppTop";


function App() {


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
