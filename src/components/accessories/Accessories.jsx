import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AccessoriesList from './AccessoriesList.jsx'
import EditAccessory from './EditAccessory.jsx'

export default function Accessories() {
    return (
        <div style={{ height: '100%', overFlow: 'hidden', overflowY: 'auto', padding: '10px' }}>
            <Routes>
                <Route path="/edit/:accID" element={<EditAccessory />} />
                <Route path="/new" element={<EditAccessory />} />
                <Route path="*" element={<AccessoriesList />} />
            </Routes>
        </div>
    )
}
