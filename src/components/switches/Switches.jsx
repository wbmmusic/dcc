import React from 'react'
import { Route, Routes } from 'react-router-dom'
import EditSwitch from './EditSwitch.jsx'
import SwitchesList from './SwitchesList.jsx'

export default function Switches() {
    return (
        <div style={{ height: '100%', overFlow: 'hidden', overflowY: 'auto', padding: '10px' }}>
            <Routes>
                <Route path="/edit/:switchID" element={<EditSwitch />} />
                <Route path="/new" element={<EditSwitch />} />
                <Route path="*" element={<SwitchesList />} />
            </Routes>
        </div>
    )
}
