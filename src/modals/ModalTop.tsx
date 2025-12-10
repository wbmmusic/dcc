import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LocoControl from './LocoControl.jsx'

export default function ModalTop() {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Routes>
                <Route path="/throttle/*" element={<LocoControl />} />
            </Routes>
        </div>
    )
}
