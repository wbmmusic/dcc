import React from 'react'
import { Route, Routes } from 'react-router-dom'
import MacroList from './MacroList'
import EditMacro from './EditMacro'

export default function Macros() {
    return (
        <div style={{ height: '100%', overFlow: 'hidden', overflowY: 'auto', padding: '10px' }}>
            <Routes>
                <Route path="/edit/:macroID" element={<EditMacro />} />
                <Route path="/new" element={<EditMacro />} />
                <Route path="*" element={<MacroList />} />
            </Routes>
        </div>
    )
}
