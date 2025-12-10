import React, { useState } from 'react'
import { useTheme } from '../ui'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import LocomotiveList from './locomotives/LocomotiveList.jsx'
import EditLocomotive from './locomotives/EditLocomotive.jsx'
import Decoders from './decoders/Decoders.jsx'
import Switches from './switches/Switches.jsx'
import AccessoriesList from './accessories/AccessoriesList.jsx'
import EditAccessory from './accessories/EditAccessory.jsx'
import MacroList from './macros/MacroList.jsx'
import EditMacro from './macros/EditMacro.jsx'

export default function System() {
    const theme = useTheme()
    const navigate = useNavigate()
    const location = useLocation()

    const tabs = [
        { id: 'locomotives', label: 'Locomotives', path: '/system/locomotives' },
        { id: 'decoders', label: 'Decoders', path: '/system/decoders' },
        { id: 'switches', label: 'Switches', path: '/system/switches' },
        { id: 'accessories', label: 'Accessories', path: '/system/accessories' },
        { id: 'macros', label: 'Macros', path: '/system/macros' }
    ]

    const getActiveTab = () => {
        const path = location.pathname
        if (path.includes('/locomotives')) return 'locomotives'
        if (path.includes('/decoders')) return 'decoders'
        if (path.includes('/switches')) return 'switches'
        if (path.includes('/accessories')) return 'accessories'
        if (path.includes('/macros')) return 'macros'
        return 'locomotives'
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
                display: 'flex',
                gap: '0',
                borderBottom: `2px solid ${theme.colors.gray[700]}`,
                backgroundColor: theme.colors.background.medium,
                padding: `0 ${theme.spacing.md}`
            }}>
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => navigate(tab.path)}
                        style={{
                            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                            cursor: 'pointer',
                            borderBottom: getActiveTab() === tab.id ? `3px solid ${theme.colors.primary}` : '3px solid transparent',
                            color: getActiveTab() === tab.id ? theme.colors.light : theme.colors.gray[400],
                            fontWeight: getActiveTab() === tab.id ? 'bold' : 'normal',
                            transition: 'all 0.2s ease',
                            fontSize: theme.fontSize.md
                        }}
                        onMouseEnter={(e) => {
                            if (getActiveTab() !== tab.id) {
                                e.currentTarget.style.color = theme.colors.light
                                e.currentTarget.style.backgroundColor = theme.colors.gray[700]
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (getActiveTab() !== tab.id) {
                                e.currentTarget.style.color = theme.colors.gray[400]
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }
                        }}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: theme.spacing.md }}>
                <Routes>
                    <Route path="/locomotives" element={<LocomotiveList />} />
                    <Route path="/locomotives/new" element={<EditLocomotive />} />
                    <Route path="/locomotives/edit/:locoID" element={<EditLocomotive />} />
                    <Route path="/decoders/*" element={<Decoders />} />
                    <Route path="/switches/*" element={<Switches />} />
                    <Route path="/accessories" element={<AccessoriesList />} />
                    <Route path="/accessories/new" element={<EditAccessory />} />
                    <Route path="/accessories/edit/:accessoryID" element={<EditAccessory />} />
                    <Route path="/macros" element={<MacroList />} />
                    <Route path="/macros/new" element={<EditMacro />} />
                    <Route path="/macros/edit/:macroID" element={<EditMacro />} />
                    <Route path="*" element={<LocomotiveList />} />
                </Routes>
            </div>
        </div>
    )
}
