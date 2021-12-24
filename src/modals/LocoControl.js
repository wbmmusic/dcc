import { isDisabled } from '@testing-library/user-event/dist/utils'
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'

export default function LocoControl() {
    const [state, setState] = useState({
        name: 'Metra',
        number: '163',
        direction: 'stop',
        speed: 0
    })
    useEffect(() => {
        document.title = "Throttle"
    }, [])

    const isDisabled = (dir) => {
        if (state.direction === dir) return true
        else return false
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
                                <td rowSpan={3} style={{ width: '150px' }}>
                                    <div style={{ position: 'absolute', top: '30px', display: 'inline-block' }} >Speed</div>
                                    <div style={{ textAlign: 'center', fontSize: '60px' }}><b>{state.speed}</b></div>
                                </td>
                                <td>
                                    <Button
                                        style={{ width: '100%' }}
                                        disabled={isDisabled('forward')}
                                        onClick={() => setState(old => ({ ...old, direction: 'forward' }))}
                                        variant='success'
                                        size="sm"
                                    >Forward</Button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <Button
                                        style={{ width: '100%' }}
                                        disabled={isDisabled('stop')}
                                        onClick={() => setState(old => ({ ...old, direction: 'stop' }))}
                                        variant='danger'
                                        size="sm"
                                    >Stop</Button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <Button
                                        style={{ width: '100%' }}
                                        disabled={isDisabled('reverse')}
                                        onClick={() => setState(old => ({ ...old, direction: 'reverse' }))}
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
                            max={255}
                            onChange={(e) => setState(old => ({ ...old, speed: parseInt(e.target.value) }))}
                        />
                    </div>
                    <div style={{ paddingLeft: '5px' }}>255</div>
                </div>

            </div>
            <div style={{ backgroundColor: 'pink', height: '100%' }}>Functions</div>
            <div style={{ padding: '4px' }}>
                <Button
                    variant='danger'
                    style={{ width: '100%' }}
                    onClick={() => console.log("Click")}
                    onDoubleClick={() => console.log('Double Click')}
                >E-Stop</Button>
            </div>
        </div>
    )
}
