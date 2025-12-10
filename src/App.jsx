import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import MainApp from "./MainApp.jsx";
import ModalTop from "./modals/ModalTop.jsx";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/modal/*" element={<ModalTop />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
