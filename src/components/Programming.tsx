import React, { useState } from 'react'
import { useTheme } from '../ui'
import CVedit from '../CVedit.jsx'
import ProgrammingTrack from './ProgrammingTrack.jsx'

export default function Programming() {
    const theme = useTheme()
    const [activeTab, setActiveTab] = useState('mainTrack')

    const tabs = [
        { id: 'mainTrack', label: 'Main Track (Ops Mode)' },
        { id: 'programmingTrack', label: 'Programming Track (Service Mode)' }
    ]

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
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                            cursor: 'pointer',
                            borderBottom: activeTab === tab.id ? `3px solid ${theme.colors.primary}` : '3px solid transparent',
                            color: activeTab === tab.id ? theme.colors.light : theme.colors.gray[400],
                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                            transition: 'all 0.2s ease',
                            fontSize: theme.fontSize.md
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.color = theme.colors.light
                                e.currentTarget.style.backgroundColor = theme.colors.gray[700]
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.color = theme.colors.gray[400]
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }
                        }}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
                {activeTab === 'mainTrack' && <CVedit />}
                {activeTab === 'programmingTrack' && <ProgrammingTrack />}
            </div>
        </div>
    )
}
