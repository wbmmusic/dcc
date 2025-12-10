import React, { useState, useEffect } from 'react'
import { useTheme } from '../ui'
import Toolbar from "./Toolbar.jsx";
import Layout from '../layouts/Layout.jsx';
import { Route, Routes } from 'react-router-dom';
import Consists from './consists/Consists.jsx';
import AccessoryButtons from './accessories/AccessoryButtons.jsx';
import LocoControl from '../modals/LocoControl.jsx';
import Settings from './Settings.jsx';
import Programming from './Programming.jsx';
import LocoBar from './locoBar/LocoBar.jsx';
import ThemeDemo from './ThemeDemo.jsx';
import System from './System.jsx';


export default function AppTop() {
    const theme = useTheme()
    const [state, setState] = useState({ selectedLoco: 0, activeTrack: 0 })

    const setTrack = (track) => setState(old => ({ ...old, activeTrack: track }))
    const selectLoco = (locoIndex) => setState(old => ({ ...old, selectedLoco: locoIndex }))

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === ' ' || e.key === 'Escape') {
                e.preventDefault()
                window.electron.invoke('mainWindowThrottle', state.selectedLoco, 'eStopAll')
            } else if (e.key >= '1' && e.key <= '3') {
                setTrack(parseInt(e.key))
            } else if (e.key === '0') {
                setTrack(0)
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [state.selectedLoco])

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div><Toolbar /></div>
            <div style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', maxWidth: '100%', maxHeight: '100%', display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: '300px', height: '100%', overflow: 'hidden' }}><LocoControl selectedLoco={state.selectedLoco} /></div>
                    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', height: '100%' }}>
                        <Routes>
                            <Route path="/system/*" element={<System />} />
                            <Route path="/consists/*" element={<Consists />} />
                            <Route path="/programming" element={<Programming />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/theme-demo" element={<ThemeDemo />} />
                            <Route path="*" element={
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <LocoBar selectedLoco={state.selectedLoco} selectLoco={selectLoco} />
                                    <div style={{
                                        height: '100%', width: '100%', maxWidth: '100%', display: 'flex',
                                        flexDirection: 'column', overflow: 'hidden', backgroundColor: theme.colors.background.dark
                                    }}>
                                        <Layout activeTrack={state.activeTrack} setActiveTrack={setTrack} />
                                    </div>
                                    <div style={{ padding: theme.spacing.sm }}><AccessoryButtons /></div>
                                </div>
                            }
                            />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    )
}