import React, { useEffect, useState } from 'react'
import { Button, Dropdown, useTheme } from '../ui'
import { useLocation, useNavigate } from 'react-router-dom'
import USBstatus from './USBstatus.jsx';

export default function Toolbar() {
    const theme = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [windowsAreOpen, setWindowsAreOpen] = useState(false)

    const makeHomeBtn = () => {
        if (location.pathname !== '/') return <Button style={{ marginLeft: theme.spacing.md }} size="sm" onClick={() => navigate('/')} >Home</Button>
    }

    const makeCloseThrottlesBtn = () => {
        if (windowsAreOpen) {
            return (
                <Button
                    variant='warning'
                    style={{ marginLeft: theme.spacing.md }}
                    size="sm"
                    onClick={() => window.electron.send('closeThrottles')}
                >
                    Close Throttles
                </Button>
            )
        }
    }

    useEffect(() => {
        window.electron.receive('throttlesClosed', () => setWindowsAreOpen(false))
        window.electron.receive('throttlesOpen', () => setWindowsAreOpen(true))
        window.electron.receive('checkThrottles', () => window.electron.send('checkThrottles'))

        return () => {
            window.electron.removeListener('throttlesClosed')
            window.electron.removeListener('throttlesOpen')
            window.electron.removeListener('checkThrottles')
        }
    }, [])

    return (
        <div style={{
            backgroundColor: theme.colors.background.dark,
            padding: theme.spacing.xs,
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.colors.gray[700]}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>

            <Button style={{ width: '150px' }} variant='danger' size="sm">E-STOP ALL</Button>
            <USBstatus />
            <div style={{ textAlign: 'right', width: '100%', display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
                {makeHomeBtn()}
                {makeCloseThrottlesBtn()}
                <div style={{ display: 'inline-block', marginLeft: theme.spacing.md }}>
                    <Dropdown
                        label="Menu"
                        items={[
                            { label: 'Home', onClick: () => navigate('/') },
                            { label: 'System', onClick: () => navigate('/system/locomotives') },
                            { label: 'Consists', onClick: () => navigate('/consists') },
                            { label: 'Programming', onClick: () => navigate('/programming') },
                            { label: 'Settings', onClick: () => navigate('/settings') },
                            { label: 'Theme Demo', onClick: () => navigate('/theme-demo') }
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}

