import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import Select from 'react-select'
import { selectStyle } from './styles'

export default function CVedit() {
    const [state, setState] = useState({ loco: '', cv: '', value: '' })
    const [locos, setLocos] = useState([])

    const isProgrammable = () => {
        console.log(state)
        return true
        if (state.loco === '' || isNaN(state.loco)) return false
        if (state.cv === '' || isNaN(state.cv)) return false
        if (state.value === '' || isNaN(state.value)) return false
        return true
    }

    const makeOptions = () => {
        let out = []
        locos.forEach(loco => out.push({ label: `${loco.name} ${loco.number}`, value: loco._id }))
        return out
    }

    const makeValue = () => {
        const locoIDX = locos.findIndex(loco => loco._id === state.loco)
        if (locoIDX >= 0) return { label: `${locos[locoIDX].name} ${locos[locoIDX].number}`, value: locos[locoIDX]._id }
        return null
    }

    const getLocoAddress = () => {
        const locoIDX = locos.findIndex(loco => loco._id === state.loco)
        if (locoIDX >= 0) return locos[locoIDX].address
        return new Error('ERRORRR')
    }

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getLocomotives')
            .then(res => setLocos(res))
            .catch(err => console.error(err))
    }, [])

    return (
        <div style={{ padding: '10px' }}>
            <div className='pageContainer'>
                <div><b>CV Programmer</b></div>
                <hr />
                <div>
                    <Table size='sm'>
                        <tbody>
                            <tr>
                                <td style={labelStyle}>Loco</td>
                                <td>
                                    <Select
                                        styles={selectStyle}
                                        options={makeOptions()}
                                        value={makeValue()}
                                        onChange={(e) => setState(old => ({ ...old, loco: e.value }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>CV</td>
                                <td>
                                    <input
                                        type="number"
                                        min={0}
                                        max={255}
                                        value={state.cv}
                                        onChange={(e) => setState(old => ({ ...old, cv: parseInt(e.target.value) }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Value</td>
                                <td>
                                    <input
                                        type="number"
                                        min={0}
                                        max={255}
                                        value={state.value}
                                        onChange={(e) => setState(old => ({ ...old, value: parseInt(e.target.value) }))}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <Button
                        size='sm'
                        disabled={!isProgrammable()}
                        onClick={() => {
                            window.electron.ipcRenderer.invoke('setCV', getLocoAddress(), state.cv, state.value)
                                .then(res => console.log(res))
                                .catch(err => console.error(err))
                        }}
                    >Program</Button>
                </div>
            </div>
        </div>
    )
}

const labelStyle = { textAlign: 'right' }