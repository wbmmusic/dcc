import React, { useEffect, useState } from 'react'
import { Button, Table, useTheme } from './ui'
import Select from 'react-select'
import { selectStyle } from './styles'

export default function CVedit() {
    const theme = useTheme()
    const [state, setState] = useState({ loco: '', cv: '', value: '' })
    const [locos, setLocos] = useState<Locomotive[]>([])

    const isProgrammable = () => {
        console.log(state)
        if (state.loco === '' || state.loco === undefined) return false
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
        window.electron.invoke('getLocomotives')
            .then(res => setLocos(res))
            .catch(err => console.error(err))
    }, [])

    return (
        <div style={{ padding: theme.spacing.md }}>
            <div className='pageContainer'>
                <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>Main Track CV Programmer</div>
                <hr style={{ borderColor: theme.colors.gray[600] }} />
                <div>
                    <Table size='sm'>
                        <tbody>
                            <tr>
                                <td style={labelStyle}>Loco:</td>
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
                                <td style={labelStyle}>CV:</td>
                                <td>
                                    <input
                                        style={{ 
                                            minWidth: '150px',
                                            backgroundColor: theme.colors.gray[800],
                                            color: theme.colors.light,
                                            border: `1px solid ${theme.colors.gray[600]}`,
                                            borderRadius: theme.borderRadius.sm,
                                            padding: theme.spacing.xs
                                        }}
                                        type="number"
                                        min={0}
                                        max={255}
                                        placeholder='CV#'
                                        value={state.cv}
                                        onChange={(e) => setState(old => ({ ...old, cv: parseInt(e.target.value) }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Value:</td>
                                <td>
                                    <input
                                        style={{ 
                                            backgroundColor: theme.colors.gray[800],
                                            color: theme.colors.light,
                                            border: `1px solid ${theme.colors.gray[600]}`,
                                            borderRadius: theme.borderRadius.sm,
                                            padding: theme.spacing.xs
                                        }}
                                        type="number"
                                        min={0}
                                        max={255}
                                        value={state.value}
                                        placeholder='CV val'
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
                            window.electron.invoke('setCV', getLocoAddress(), state.cv, state.value)
                                .then(res => console.log(res))
                                .catch(err => console.error(err))
                        }}
                    >Program</Button>
                </div>
            </div>
        </div>
    )
}

const labelStyle: React.CSSProperties = { textAlign: 'right' }