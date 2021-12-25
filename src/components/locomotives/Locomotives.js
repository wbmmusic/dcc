import React from 'react'
import { Route, Routes } from 'react-router-dom'
import EditLocomotive from './EditLocomotive'
import LocomotiveList from './LocomotiveList'

export default function Locomotives() {
    return (
        <div style={{ height: '100%', overFlow: 'hidden', overflowY: 'auto', padding: '10px' }}>
            <Routes>
                <Route path="/new" element={<EditLocomotive />} />
                <Route path="/edit/:locoID" element={<EditLocomotive />} />
                <Route path="*" element={<LocomotiveList />} />
            </Routes>
        </div>
    )
}
