/**
 * Locomotive Control Component
 * 
 * This component provides the primary interface for controlling DCC locomotives.
 * It displays locomotive information, speed control, direction control, and
 * function buttons for lights, sounds, and other decoder features.
 * 
 * Features:
 * - Real-time locomotive status display with speed and direction
 * - Speed control with 0-126 step range via slider
 * - Direction control (forward/reverse) with visual indicators
 * - Function button grid for decoder features (lights, horn, bell, etc.)
 * - Visual feedback for active functions with glow effects
 * - Emergency stop capability (single click for selected loco, double-click for all)
 * - Support for both toggle and momentary function types
 * - Modal and embedded display modes
 */

import React, { useEffect, useState } from 'react'
import { Button, useTheme } from '../ui'
import { useLocation } from 'react-router-dom'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

import { LocoControlProps, LocoState, LocoFunction } from '../types';

/**
 * Locomotive Control Component
 * 
 * Provides comprehensive control interface for a selected DCC locomotive including:
 * - Speed and direction control with real-time feedback
 * - Function button management with toggle/momentary support
 * - Locomotive photo display and identification
 * - Emergency stop functionality with safety features
 * 
 * The component automatically detects whether it's running in modal mode (separate window)
 * or embedded mode (main window panel) and adjusts IPC communication accordingly.
 * 
 * Communication:
 * - Uses Electron IPC to send DCC commands to the main process
 * - Receives real-time updates about locomotive status changes
 * - Handles both individual locomotive and system-wide emergency stops
 * 
 * @param {LocoControlProps} props - Component props containing selected locomotive index
 * @returns {React.JSX.Element} The locomotive control interface
 */
export default function LocoControl({ selectedLoco }: LocoControlProps) {
    const theme = useTheme()
    const location = useLocation()
    const [state, setState] = useState<LocoState | null>(null)
    const isModal = location.pathname.includes('/modal')

    const makeChannel = (): [string, ...any[]] => {
        if (isModal) return [window.electron.getWindowID() || '']
        else return ['mainWindowThrottle', state?._id || selectedLoco]
    }


    useEffect(() => {
        window.electron.invoke(...makeChannel(), "getThrottle")
            .then((res: unknown) => setState(res as LocoState))
            .catch((err: unknown) => console.log(err))

        if (!isModal) {
            window.electron.receive('throttleUpdate', (locomotiveId: unknown) => {
                if (locomotiveId === (state?._id || selectedLoco)) {
                    window.electron.invoke(...makeChannel(), "getThrottle")
                        .then((res: unknown) => setState(res as LocoState))
                        .catch((err: unknown) => console.log(err))
                }
            })
        } else {
            window.electron.receive('modalThrottleUpdate', () => {
                window.electron.invoke(...makeChannel(), "getThrottle")
                    .then((res: unknown) => setState(res as LocoState))
                    .catch((err: unknown) => console.log(err))
            })
        }

        return () => {
            if (!isModal) window.electron.removeListener('throttleUpdate')
            else window.electron.removeListener('modalThrottleUpdate')
        }

    }, [selectedLoco])

    //useEffect(() => console.log(state), [state])

    if (!state || state.name === undefined) {
        return (
            <div style={{ height: '100%', textAlign: 'center', paddingTop: theme.spacing.md, backgroundColor: theme.colors.background.dark, color: theme.colors.light }}><b>No Locomotives</b></div>
        )
    }

    const isDisabled = (dir: string): boolean => {
        if (state?.direction === dir) return true
        else return false
    }

    const setDirection = (dir: string) => {
        window.electron.invoke(...makeChannel(), 'setDirection', dir)
            .then((newDir: unknown) => setState(old => old ? ({ ...old, direction: newDir as any }) : null))
            .catch((err: unknown) => console.log(err))
    }

    const setSpeed = (speed: string) => {
        window.electron.invoke(...makeChannel(), 'setSpeed', parseInt(speed))
            .then((newSpeed: unknown) => setState(old => old ? ({ ...old, speed: newSpeed as number }) : null))
            .catch((err: unknown) => console.log(err))
    }

    const sendEStop = () => {
        window.electron.invoke(...makeChannel(), 'eStop')
            .then((res: unknown) => setState(old => old ? ({ ...old, speed: res as number }) : null))
            .catch((err: unknown) => console.log(err))
    }

    const sendEStopAll = () => {
        window.electron.invoke(...makeChannel(), 'eStopAll')
            .then((res: unknown) => console.log(res))
            .catch((err: unknown) => console.log(err))
    }

    const handleFunctionPress = (func: number) => {
        window.electron.invoke(...makeChannel(), 'setFunction', func)
            .then((res: unknown) => setState(old => old ? ({ ...old, functions: res as LocoFunction[] }) : null))
            .catch((err: unknown) => console.log(err))
    }

    const makeFunctions = (): React.ReactElement[] => {
        let out: React.ReactElement[] = []

        if (!state?.functions) return out
        state.functions.forEach((func: LocoFunction, i: number) => {
            if (func.name !== '') {
                if ((func as any).action === 'toggle') {
                    out.push(
                        <Button
                            variant={func.state ? 'success' : 'secondary'}
                            key={`${func.name}function${i}`}
                            style={{ 
                                marginRight: theme.spacing.sm, 
                                marginBottom: theme.spacing.sm,
                                boxShadow: func.state ? `0 0 8px ${theme.colors.success}` : 'none'
                            }}
                            size='sm'
                            onMouseDown={() => handleFunctionPress(i)}
                        > {func.name}</Button >
                    )
                } else {
                    out.push(
                        <Button
                            variant={func.state ? 'success' : 'secondary'}
                            key={`${func.name}function${i}`}
                            style={{ 
                                marginRight: theme.spacing.sm, 
                                marginBottom: theme.spacing.sm,
                                boxShadow: func.state ? `0 0 8px ${theme.colors.success}` : 'none'
                            }}
                            size='sm'
                            onMouseDown={() => handleFunctionPress(i)}
                            onMouseUp={() => handleFunctionPress(i)}
                        > {func.name}</Button >
                    )
                }

            }

        })


        return out
    }

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background.dark, color: theme.colors.light }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${theme.colors.border}`, fontSize: theme.fontSize.lg, padding: theme.spacing.sm, alignItems: 'center' }}>
                <div style={{ whiteSpace: 'nowrap' }}><b>{state.name}</b></div>
                <div style={{ textAlign: 'right', width: '100%', fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.warning }}>{state.number}</div>
            </div>
            <div style={{ flex: '0 0 auto' }}>
                <div style={{ padding: theme.spacing.md }}>
                    <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'stretch', flex: '0 0 auto' }}>
                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center', fontSize: '48px', fontWeight: 'bold', color: theme.colors.warning, lineHeight: '1' }}>
                                {state.speed}
                            </div>
                            <div style={{ textAlign: 'center', fontSize: theme.fontSize.md, color: theme.colors.gray[400], marginTop: theme.spacing.xs }}>
                                {Math.round((state.speed / 126) * 100)}%
                            </div>
                        </div>
                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                            <Button
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs }}
                                disabled={isDisabled('forward')}
                                onClick={() => setDirection('forward')}
                                variant={state.direction === 'forward' ? 'success' : 'outline-secondary'}
                                size="sm"
                            >
                                <ArrowUpwardIcon style={{ fontSize: '16px' }} />
                                Forward
                            </Button>
                            <Button
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs }}
                                disabled={isDisabled('reverse')}
                                onClick={() => setDirection('reverse')}
                                variant={state.direction === 'reverse' ? 'success' : 'outline-secondary'}
                                size="sm"
                            >
                                <ArrowDownwardIcon style={{ fontSize: '16px' }} />
                                Reverse
                            </Button>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: theme.spacing.md, marginTop: theme.spacing.sm }}>
                        <img style={{ width: '100%', maxHeight: '70px', objectFit: 'contain', border: `2px solid ${theme.colors.gray[600]}`, borderRadius: theme.borderRadius.sm, padding: theme.spacing.sm, backgroundColor: theme.colors.gray[900] }} src={`loco://${state.photo}`} alt="loco" />
                    </div>
                </div>
                <div style={{ padding: theme.spacing.md, display: 'flex', alignItems: 'center', borderTop: `1px solid ${theme.colors.border}`, marginTop: theme.spacing.md, backgroundColor: theme.colors.background.light }}>
                    <div style={{ paddingRight: theme.spacing.sm, fontSize: theme.fontSize.sm, fontWeight: 'bold' }}>0</div>
                    <div style={{ width: '100%' }}>
                        <input
                            style={{ width: '100%', cursor: 'pointer' }}
                            type={'range'}
                            value={state.speed}
                            max={126}
                            onChange={(e) => setSpeed(e.target.value)}
                        />
                    </div>
                    <div style={{ paddingLeft: theme.spacing.sm, fontSize: theme.fontSize.sm, fontWeight: 'bold' }}>126</div>
                </div>
            </div>
            <div style={{ height: '100%', padding: theme.spacing.sm, overflow: 'hidden', overflowY: 'auto', backgroundColor: theme.colors.background.medium }}>
                {makeFunctions()}
            </div>
            <div style={{ padding: theme.spacing.xs }}>
                <Button
                    variant='danger'
                    style={{ width: '100%' }}
                    onClick={() => sendEStop()}
                    onDoubleClick={() => sendEStopAll()}
                >E-Stop</Button>
            </div>
        </div>
    )
}
