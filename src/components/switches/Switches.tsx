import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { useTheme } from '../../ui'
import EditSwitch from './EditSwitch.jsx'
import SwitchesList from './SwitchesList.jsx'

export default function Switches() {
    const theme = useTheme()
    return (
        <div style={{ height: '100%', overflow: 'hidden', overflowY: 'auto' }}>
            <div style={{ padding: '10px' }}>
                <Routes>
                    <Route path="/edit/:switchID" element={<EditSwitch />} />
                    <Route path="/new" element={<EditSwitch />} />
                    <Route path="*" element={<SwitchesList />} />
                </Routes>
            </div>
        </div>
    )
}
