import React from 'react'
import { Route, Routes } from 'react-router-dom'
import MacroList from './MacroList.jsx'
import EditMacro from './EditMacro.jsx'

export default function Macros() {
    return (
        <div style={{ height: '100%', overflow: 'hidden', overflowY: 'auto', padding: '10px' }}>
            <Routes>
                <Route path="/edit/:macroID" element={<EditMacro />} />
                <Route path="/new" element={<EditMacro />} />
                <Route path="*" element={<MacroList />} />
            </Routes>
        </div>
    )
}
