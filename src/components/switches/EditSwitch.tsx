import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button, Table, useTheme } from '../../ui'
import { Switch, SwitchForm } from '../../types'

export default function EditSwitch() {
    const theme = useTheme()
    const location = useLocation()
    const navigate = useNavigate()
    const theID = useParams().switchID
    console.log(theID)
    const [state, setState] = useState<SwitchForm>({ _id: '', name: '', address: '', reverse: false, state: false })
    const [ogState, setOgState] = useState<SwitchForm | null>(null)


    useEffect(() => {
        if (location.pathname.includes('new')) {

        } else if (location.pathname.includes('edit')) {
            window.electron.invoke('getSwitchByID', theID as string)
                .then((res: unknown) => {
                    const switchData = res as Switch
                    const formData: SwitchForm = {
                        ...switchData,
                        address: switchData.address.toString()
                    }
                    setState(formData)
                    setOgState(formData)
                })
                .catch((err: unknown) => console.log(err))
        } else console.error("Error in use effect")
    }, [theID])

    useEffect(() => {
        console.log(state.reverse)
    }, [state.reverse])


    const makeTitle = () => {
        let out = 'ERROR'
        if (location.pathname.includes('new')) out = 'Create'
        else if (location.pathname.includes('edit')) out = 'Edit'
        return <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>{`${out} Switch`}</div>
    }

    const createSwitch = () => {
        const switchData: Switch = {
            _id: window.electron.uuid(),
            name: state.name,
            address: parseInt(state.address),
            reverse: state.reverse,
            state: false
        }
        window.electron.invoke('createSwitch', switchData as any)
            .then(() => navigate('/switches'))
            .catch((err: unknown) => console.log(err))
    }

    const updateSwitch = () => {
        const switchData: Switch = {
            _id: state._id,
            name: state.name,
            address: parseInt(state.address),
            reverse: state.reverse,
            state: state.state
        }
        window.electron.invoke('updateSwitch', switchData as any)
            .then(() => navigate('/switches'))
            .catch((err: unknown) => console.log(err))
    }

    const makeButtons = () => {

        const makeButton = () => {
            if (location.pathname.includes('new')) {
                return <Button variant='success' size='sm' disabled={!isCreatable()} onClick={createSwitch}>Create Switch</Button>
            } else if (location.pathname.includes('edit')) {
                return <Button variant='success' size='sm' disabled={!isUpdatable()} onClick={updateSwitch}>Update Switch</Button>
            } else return "ERROR"
        }

        return (
            <div style={{ textAlign: 'right' }}>
                <Button variant='secondary' size='sm' onClick={() => navigate('/switches')}>Cancel</Button>
                <div style={{ display: 'inline-block', width: theme.spacing.sm }} />
                {makeButton()}
            </div>
        )
    }

    const isCreatable = (): boolean => {
        if (state.name !== '' && !isNaN(parseInt(state.address)) && parseInt(state.address) >= 0) return true
        else return false
    }

    const isUpdatable = (): boolean => {
        if (!isCreatable()) return false
        if (JSON.stringify(state) === JSON.stringify(ogState)) return false
        return true
    }

    return (
        <div className='pageContainer'>
            {makeTitle()}
            <hr style={{ borderColor: theme.colors.gray[600] }} />
            <div>
                <div style={{ display: 'inline-block' }}>
                    <Table size='sm'>
                        <tbody>
                            <tr>
                                <td style={labelStyle}>Name:</td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder='Switch Name'
                                        value={state.name}
                                        onChange={(e) => setState((old: SwitchForm) => ({ ...old, name: e.target.value }))}
                                        style={{
                                            backgroundColor: theme.colors.gray[800],
                                            color: theme.colors.light,
                                            border: `1px solid ${theme.colors.gray[600]}`,
                                            borderRadius: theme.borderRadius.sm,
                                            padding: theme.spacing.xs
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Address:</td>
                                <td>
                                    <input
                                        type="number"
                                        min={0} step={1}
                                        placeholder='123'
                                        value={state.address}
                                        onChange={(e) => setState((old: SwitchForm) => ({ ...old, address: e.target.value }))}
                                        style={{
                                            backgroundColor: theme.colors.gray[800],
                                            color: theme.colors.light,
                                            border: `1px solid ${theme.colors.gray[600]}`,
                                            borderRadius: theme.borderRadius.sm,
                                            padding: theme.spacing.xs
                                        }}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Reverse:</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        min={0} step={1}
                                        checked={state.reverse}
                                        onChange={(e) => setState((old: SwitchForm) => ({ ...old, reverse: !old.reverse }))}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
            {makeButtons()}
        </div>
    )
}

const labelStyle: React.CSSProperties = { textAlign: 'right' }