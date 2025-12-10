import React, { useEffect, useState } from 'react'
import { Button } from '../../ui'
import { Table } from '../../ui'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { selectStyle } from '../../styles'
import Select from 'react-select'
import { accessories } from './options'

export default function EditAccessory() {
    const location = useLocation()
    const navigate = useNavigate()
    const accID = useParams().accID
    const [state, setState] = useState({ name: '', address: '', device: {} })
    const [ogState, setOgState] = useState(null)

    const makeTitle = () => {
        if (location.pathname.includes('edit')) return "Edit"
        else if (location.pathname.includes('new')) return "Create"
        else return "ERROR"
    }

    const makeOptions = () => {
        let out = []
        accessories.forEach(acc => out.push({ label: acc.name, value: acc._id }));
        return out
    }

    const createAccessory = () => {
        window.electron.invoke('createAccessory', {
            _id: window.electron.uuid(),
            ...state
        })
            .then(navigate('/accessories'))
            .catch(err => console.error(err))
    }

    const updateAccessory = () => {
        window.electron.invoke('updateAccessory', state)
            .then(navigate('/accessories'))
            .catch(err => console.error(err))
    }

    const isCreatable = () => {
        if (state.name === '' || state.address === '' || isNaN(state.address)) return false
        return true
    }

    const isUpdatable = () => {
        if (!isCreatable()) return false
        if (JSON.stringify(state) === JSON.stringify(ogState)) return false
        return true
    }

    const makeButton = () => {
        if (location.pathname.includes("edit")) return <Button disabled={!isUpdatable()} size="sm" onClick={updateAccessory}>Update Accessory</Button>
        else if (location.pathname.includes("new")) return <Button disabled={!isCreatable()} size="sm" onClick={createAccessory}>Create Accessory</Button>
        else throw new Error('Error in makeButton')
    }

    const makeDeviceInput = () => {
        if (state.device.name === undefined) return

        const makeInputRows = () => {
            let out = []
            if (state.device.actions === undefined) return
            state.device.actions.forEach((act, i) => {
                out.push(
                    <tr key={`actionRow${i}`}>
                        <td><b>{i}</b></td>
                        <td>
                            <input
                                style={{ width: '100%' }}
                                value={act.name}
                                placeholder={`Function ${i} name`}
                                onChange={(e) => {
                                    let tempActions = [...state.device.actions]
                                    tempActions[i].name = e.target.value
                                    setState(old => ({ ...old, device: { ...old.device, actions: tempActions } }))
                                }}
                            />
                        </td>
                    </tr>
                )
            })
            return out
        }

        return (
            <div>
                <Table size='sm'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {makeInputRows()}
                    </tbody>
                </Table>
            </div>
        )
    }

    const loadDevice = (id) => {
        let devIDX = accessories.findIndex(acc => acc._id === id)
        if (devIDX < 0) return new Error('Error in loadDevice')
        setState(old => ({ ...old, device: accessories[devIDX] }))
    }

    const makeValue = () => {
        if (state.device.name === undefined || state.device._id === undefined) return null
        return { label: state.device.name, value: state.device._id }
    }

    useEffect(() => {
        if (location.pathname.includes('edit')) {
            window.electron.invoke('getAccessoryByID', accID)
                .then(res => {
                    setState(JSON.parse(JSON.stringify(res)))
                    setOgState(JSON.parse(JSON.stringify(res)))
                })
                .catch(err => console.error(err))
        }
    }, [])


    return (
        <div className='pageContainer' >
            <div><b>{`${makeTitle()} Accessory`}</b></div>
            <div>
                <div>
                    <Table>
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder='Name this accessory'
                                        value={state.name}
                                        onChange={(e) => setState(old => ({ ...old, name: e.target.value }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Address</td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder='1234'
                                        value={state.address.toString()}
                                        onChange={(e) => setState(old => ({ ...old, address: parseInt(e.target.value) }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Device</td>
                                <td>
                                    <Select
                                        styles={selectStyle}
                                        options={makeOptions()}
                                        value={makeValue()}
                                        onChange={(e) => loadDevice(e.value)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
            {makeDeviceInput()}
            <div style={{ textAlign: 'right' }}>
                <Button size="sm" style={{ marginRight: '8px' }} onClick={() => navigate('/accessories')}>Cancel</Button>
                {makeButton()}
            </div>
        </div>
    )
}
