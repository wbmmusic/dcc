import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'

export default function LocoControl() {
    const [state, setState] = useState({})

    useEffect(() => {
        window.electron.ipcRenderer.invoke(window.electron.getWindowID(), "getThrottle")
            .then(res => setState(res))
            .catch(err => console.log(err))
    }, [])

    useEffect(() => console.log(state), [state])

    const isDisabled = (dir) => {
        if (state.direction === dir) return true
        else return false
    }

    const setDirection = (dir) => {
        window.electron.ipcRenderer.invoke(window.electron.getWindowID(), 'setDirection', dir)
            .then(newDir => setState(old => ({ ...old, direction: newDir })))
            .catch(err => console.log(err))
    }

    const setSpeed = (speed) => {
        window.electron.ipcRenderer.invoke(window.electron.getWindowID(), 'setSpeed', parseInt(speed))
            .then(newSpeed => setState(old => ({ ...old, speed: newSpeed })))
            .catch(err => console.log(err))
    }

    const sendEStop = () => {
        window.electron.ipcRenderer.invoke(window.electron.getWindowID(), 'eStop')
            .then(res => setState(old => ({ ...old, speed: res })))
            .catch(err => console.log(err))
    }

    const sendEStopAll = () => {
        window.electron.ipcRenderer.invoke(window.electron.getWindowID(), 'eStopAll')
            .then(res => console.log(res))
            .catch(err => console.log(err))
    }

    const handleFunctionPress = (func) => {
        window.electron.ipcRenderer.invoke(window.electron.getWindowID(), 'setFunction', func)
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
                            variant={func.state ? 'primary' : 'secondary'}
                            key={`${func.name}function${i}`}
                            style={{ marginRight: '3px', marginBottom: '3px' }}
                            size='sm'
                            onMouseDown={() => handleFunctionPress(i)}
                        > {func.name}</Button >
                    )
                } else {
                    out.push(
                        <Button
                            variant={func.state ? 'primary' : 'secondary'}
                            key={`${func.name}function${i}`}
                            style={{ marginRight: '3px', marginBottom: '3px' }}
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
        <div style={{ width: '100vw', height: '100vh', overFlow: 'hidden', display: 'flex', flexDirection: 'column', borderTop: '1px solid lightGrey' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid lightGrey', fontSize: '20px' }}>
                <div style={{ whiteSpace: 'nowrap', paddingLeft: '5px' }}><b>{state.name}</b></div>
                <div style={{ textAlign: 'right', width: '100%', paddingRight: '5px' }}><b>{state.number}</b></div>
            </div>
            <div>
                <div style={{ padding: '10px 10px 0px 0px' }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td rowSpan={2} style={{ width: '150px' }}>
                                    <div>
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '30px',
                                                display: 'inline-block',
                                                fontSize: '14px',
                                                paddingLeft: '2px'
                                            }}
                                        >{`Speed : ${state.direction}`}</div>
                                        <div style={{ textAlign: 'center', fontSize: '30px' }}><b>{state.speed}</b>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '0px 4px' }}>
                                            <img style={{ maxHeight: '50px' }} src={`loco://${state.photo}`} alt="loco" />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <Button
                                        style={{ width: '100%' }}
                                        disabled={isDisabled('forward')}
                                        onClick={() => setDirection('forward')}
                                        variant='success'
                                        size="sm"
                                    >Forward</Button>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <Button
                                        style={{ width: '100%' }}
                                        disabled={isDisabled('reverse')}
                                        onClick={() => setDirection('reverse')}
                                        variant='warning'
                                        size="sm"
                                    >Reverse</Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '10px', display: 'flex', borderTop: '1px solid lightGrey', marginTop: '10px' }}>
                    <div style={{ paddingRight: '5px' }}>0</div>
                    <div style={{ width: '100%' }}>
                        <input
                            style={{ width: '100%' }}
                            type={'range'}
                            value={state.speed}
                            max={126}
                            onChange={(e) => setSpeed(e.target.value)}
                        />
                    </div>
                    <div style={{ paddingLeft: '5px' }}>255</div>
                </div>
            </div>
            <div style={{ backgroundColor: 'pink', height: '100%', padding: '4px' }}>
                {makeFunctions()}
            </div>
            <div style={{ padding: '4px' }}>
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
