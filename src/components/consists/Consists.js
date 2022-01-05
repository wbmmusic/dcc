import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ConsistsList from './ConsistsList'
import EditConsist from './EditConsist'

export default function Consists() {


    return (
        <div
            style={{
                padding: '10px',
                height: '100%',
                overflowY: 'auto',
                overflow: 'hidden'
            }}
        >
            <Routes>
                <Route path="/new" element={<EditConsist />} />
                <Route path="/edit/:consistID" element={<EditConsist />} />
                <Route path="*" element={<ConsistsList />} />
            </Routes>
        </div>
    )
}
