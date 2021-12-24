import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LocoControl from './LocoControl'

export default function ModalTop() {
    return (
        <div>
            <Routes>
                <Route path="/throttle/*" element={<LocoControl />} />
            </Routes>
        </div>
    )
}
