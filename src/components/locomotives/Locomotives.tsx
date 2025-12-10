import React from 'react'
import { Route, Routes } from 'react-router-dom'
import EditLocomotive from './EditLocomotive.jsx'
import LocomotiveList from './LocomotiveList.jsx'

export default function Locomotives() {
    return (
        <div style={{ height: '100%', overflow: 'hidden', overflowY: 'auto', padding: '10px' }}>
            <Routes>
                <Route path="/new" element={<EditLocomotive />} />
                <Route path="/edit/:locoID" element={<EditLocomotive />} />
                <Route path="*" element={<LocomotiveList />} />
            </Routes>
        </div>
    )
}
