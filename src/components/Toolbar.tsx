import React, { useEffect, useState, useRef } from 'react'
import { Button, IconButton, useTheme } from '../ui'
import { useLocation, useNavigate } from 'react-router-dom'
import USBstatus from './USBstatus'
import HomeIcon from '@mui/icons-material/Home'
import MenuIcon from '@mui/icons-material/Menu'

export default function Toolbar() {
    const theme = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [windowsAreOpen, setWindowsAreOpen] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const makeHomeBtn = (): React.ReactElement | undefined => {
        if (location.pathname !== '/') {
            return (
                <IconButton 
                    onClick={() => navigate('/')} 
                    title="Home"
                    style={{ marginLeft: theme.spacing.md, color: theme.colors.primary }}
                >
                    <HomeIcon />
                </IconButton>
            )
        }
        return undefined
    }

    const makeCloseThrottlesBtn = (): React.ReactElement | undefined => {
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
        return undefined
    }

    useEffect(() => {
        window.electron.receive('throttlesClosed', () => setWindowsAreOpen(false))
        window.electron.receive('throttlesOpen', () => setWindowsAreOpen(true))
        window.electron.receive('checkThrottles', () => window.electron.send('checkThrottles'))

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && e.target && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            window.electron.removeListener('throttlesClosed')
            window.electron.removeListener('throttlesOpen')
            window.electron.removeListener('checkThrottles')
            document.removeEventListener('mousedown', handleClickOutside)
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

            <Button 
                style={{ width: '150px' }} 
                variant='danger' 
                size="sm"
                onClick={() => {
                    try {
                        window.electron.send('eStopAll')
                    } catch (error) {
                        console.error('Failed to send emergency stop command:', error)
                    }
                }}
            >
                E-STOP ALL
            </Button>
            <USBstatus />
            <div style={{ textAlign: 'right', width: '100%', display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
                {makeHomeBtn()}
                {makeCloseThrottlesBtn()}
                <div ref={menuRef} style={{ position: 'relative', display: 'inline-block', marginLeft: theme.spacing.md }}>
                    <IconButton 
                        size="small" 
                        title="Menu"
                        onClick={() => setShowMenu(!showMenu)}
                        style={{ color: theme.colors.primary }}
                    >
                        <MenuIcon />
                    </IconButton>
                    {showMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: theme.spacing.xs,
                            backgroundColor: theme.colors.gray[800],
                            border: `1px solid ${theme.colors.gray[600]}`,
                            borderRadius: theme.borderRadius.md,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            minWidth: '150px',
                            zIndex: 1000,
                            color: theme.colors.light
                        }}>
                            {[
                                { label: 'Home', onClick: () => navigate('/') },
                                { label: 'System', onClick: () => navigate('/system/locomotives') },
                                { label: 'Consists', onClick: () => navigate('/consists') },
                                { label: 'Programming', onClick: () => navigate('/programming') },
                                { label: 'Settings', onClick: () => navigate('/settings') },
                                { label: 'Theme Demo', onClick: () => navigate('/theme-demo') }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        item.onClick()
                                        setShowMenu(false)
                                    }}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        borderBottom: i < 5 ? `1px solid ${theme.colors.gray[600]}` : 'none'
                                    }}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = theme.colors.gray[700]}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

