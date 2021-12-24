import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AccessoriesList from './AccessoriesList'
import EditAccessory from './EditAccessory'

export default function Accessories() {
    return (
        <div style={{ height: '100%', overFlow: 'hidden', overflowY: 'auto', padding: '10px' }}>
            <h1>Accessories</h1>
            <Routes>
                <Route path="/edit/:eccessoryID" element={<EditAccessory />} />
                <Route path="/new" element={<EditAccessory />} />
                <Route path="*" element={<AccessoriesList />} />
            </Routes>
        </div>
    )
}
