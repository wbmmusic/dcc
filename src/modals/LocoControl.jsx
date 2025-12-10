import React, { useEffect, useState } from 'react'
import { Button, useTheme } from '../ui'
import { useLocation } from 'react-router-dom'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

export default function LocoControl({ selectedLoco }) {
    const theme = useTheme()
    const location = useLocation()
    const [state, setState] = useState({})
    const isModal = location.pathname.includes('/modal')

    const makeChannel = () => {
        if (isModal) return [window.electron.getWindowID()]
        else return ['mainWindowThrottle', selectedLoco]
    }


    useEffect(() => {
        window.electron.invoke(...makeChannel(), "getThrottle")
            .then(res => setState(res))
            .catch(err => console.log(err))

        if (!isModal) {
            window.electron.receive('throttleUpdate', idx => {
                if (idx === selectedLoco) {
                    window.electron.invoke(...makeChannel(), "getThrottle")
                        .then(res => setState(res))
                        .catch(err => console.log(err))
                }
            })
        } else {
            window.electron.receive('modalThrottleUpdate', () => {
                window.electron.invoke(...makeChannel(), "getThrottle")
                    .then(res => setState(res))
                    .catch(err => console.log(err))
            })
        }

        return () => {
            if (!isModal) window.electron.removeListener('throttleUpdate')
            else window.electron.removeListener('modalThrottleUpdate')
        }

    }, [selectedLoco])

    //useEffect(() => console.log(state), [state])

    if (state.name === undefined) {
        return (
            <div style={{ height: '100%', textAlign: 'center', paddingTop: theme.spacing.md, backgroundColor: theme.colors.background.dark, color: theme.colors.light }}><b>No Locomotives</b></div>
        )
    }

    const isDisabled = (dir) => {
        if (state.direction === dir) return true
        else return false
    }

    const setDirection = (dir) => {
        window.electron.invoke(...makeChannel(), 'setDirection', dir)
            .then(newDir => setState(old => ({ ...old, direction: newDir })))
            .catch(err => console.log(err))
    }

    const setSpeed = (speed) => {
        window.electron.invoke(...makeChannel(), 'setSpeed', parseInt(speed))
            .then(newSpeed => setState(old => ({ ...old, speed: newSpeed })))
            .catch(err => console.log(err))
    }

    const sendEStop = () => {
        window.electron.invoke(...makeChannel(), 'eStop')
            .then(res => setState(old => ({ ...old, speed: res })))
            .catch(err => console.log(err))
    }

    const sendEStopAll = () => {
        window.electron.invoke(...makeChannel(), 'eStopAll')
            .then(res => console.log(res))
            .catch(err => console.log(err))
    }

    const handleFunctionPress = (func) => {
        window.electron.invoke(...makeChannel(), 'setFunction', func)
            .then(res => setState(old => ({ ...old, functions: res })))
            .catch(err => console.log(err))
    }

    const makeFunctions = () => {
        let out = []

        if (state.functions === undefined) return
        state.functions.forEach((func, i) => {
            if (func.name !== '') {
                if (func.action === 'toggle') {
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
        <div style={{ width: '100%', height: '100%', overFlow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background.dark, color: theme.colors.light }}>
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
