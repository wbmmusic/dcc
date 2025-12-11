/**
 * Main Application Top-Level Component
 * 
 * This component manages the primary user interface for the DCC railroad control system.
 * It handles locomotive selection, track routing, emergency stops, and provides navigation
 * between different system functions like programming, settings, and consists.
 */

import React, { useState, useEffect } from 'react'
import { useTheme } from '../ui'
import Toolbar from "./Toolbar";
import Layout from '../layouts/Layout';
import { Route, Routes } from 'react-router-dom';
import Consists from './consists/Consists';
import AccessoryButtons from './accessories/AccessoryButtons';
import LocoControl from '../modals/LocoControl';
import Settings from './Settings';
import Programming from './Programming';
import LocoBar from './locoBar/LocoBar';
import ThemeDemo from './ThemeDemo';
import System from './System';
import { Locomotive } from '../types';

/**
 * Application state interface for tracking user selections
 * 
 * @interface AppState
 * @property {string} selectedLoco - ID of currently selected locomotive
 * @property {number} activeTrack - Currently selected track for routing (0=Loop, 1-3=Tracks)
 */
interface AppState {
    selectedLoco: string;
    activeTrack: number;
}

/**
 * Main application component that orchestrates the DCC control interface
 * 
 * Features:
 * - Multi-locomotive control with dedicated control panel
 * - Track selection and routing visualization
 * - Emergency stop functionality (Space/Escape keys)
 * - Navigation between system configuration screens
 * - Real-time accessory control
 * - Layout visualization with interactive track selection
 * 
 * Keyboard Shortcuts:
 * - Space/Escape: Emergency stop all locomotives
 * - Keys 0-3: Select tracks (0=Loop, 1-3=Tracks)
 * 
 * Layout:
 * - Left panel: Locomotive control interface (300px fixed width)
 * - Right panel: Main content area with routing based on current page
 * - Top: Navigation toolbar
 * - Bottom: Accessory control buttons (on main page only)
 * 
 * @returns {React.JSX.Element} The complete DCC control interface
 */
export default function AppTop(): React.JSX.Element {
    const theme = useTheme()
    const [state, setState] = useState<AppState>({ selectedLoco: '', activeTrack: 0 })

    // Initialize with first locomotive ID
    useEffect(() => {
        window.electron.invoke('getLocomotives')
            .then((res: unknown) => {
                const locos = res as Locomotive[]
                if (locos.length > 0 && state.selectedLoco === '') {
                    setState(old => ({ ...old, selectedLoco: locos[0]._id }))
                }
            })
    }, [state.selectedLoco])

    /**
     * Updates the active track selection for layout routing
     * This affects the visual highlighting in the layout diagram
     * @param {number} track - Track number (0=Loop, 1-3=Tracks)
     */
    const setTrack = (track: number) => setState(old => ({ ...old, activeTrack: track }))
    
    /**
     * Selects a locomotive for control operations
     * This determines which locomotive responds to throttle commands
     * @param {string} locomotiveId - ID of locomotive to select
     */
    const selectLoco = (locomotiveId: string) => setState(old => ({ ...old, selectedLoco: locomotiveId }))

    // Set up keyboard shortcuts for emergency stops and track selection
    useEffect(() => {
        /**
         * Handles critical keyboard shortcuts for safety and convenience
         * 
         * Safety Features:
         * - Space/Escape: Immediate emergency stop of all locomotives
         * 
         * Convenience Features:
         * - Number keys 0-3: Quick track selection for routing
         * 
         * @param {KeyboardEvent} e - Keyboard event from user input
         */
        const handleKeyPress = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return
            }
            
            // Emergency stop - highest priority for safety
            if (e.key === ' ' || e.key === 'Escape') {
                e.preventDefault()
                // Send emergency stop command to all locomotives via selected loco's throttle
                // Use first available locomotive ID for emergency stop all
                window.electron.invoke('getLocomotives')
                    .then((res: unknown) => {
                        const locos = res as Locomotive[]
                        if (locos.length > 0) {
                            window.electron.invoke('mainWindowThrottle', locos[0]._id, 'eStopAll')
                        }
                    })
            } 
            // Track selection shortcuts for quick routing changes
            else if (e.key >= '1' && e.key <= '3') {
                setTrack(parseInt(e.key))  // Tracks 1-3
            } else if (e.key === '0') {
                setTrack(0)  // Loop track
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [state.selectedLoco])  // Re-bind when selected locomotive changes

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
                                    <LocoBar selectedLoco={state.selectedLoco} onSelectLocomotive={selectLoco} />
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