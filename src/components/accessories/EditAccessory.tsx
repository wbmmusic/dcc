import React, { useEffect, useState } from 'react'
import { Button, Table, useTheme } from '../../ui'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { selectStyle } from '../../styles'
import Select from 'react-select'
import { accessories } from './options'
import { AccessoryForm, Accessory, AccessoryDevice, AccessoryAction, SelectOption } from '../../types'

export default function EditAccessory() {
    const theme = useTheme()
    const location = useLocation()
    const navigate = useNavigate()
    const accID = useParams().accessoryID
    const [state, setState] = useState<AccessoryForm>({ 
        _id: '', 
        name: '', 
        address: '', 
        device: { name: '', actions: [] } 
    })
    const [ogState, setOgState] = useState<AccessoryForm | null>(null)

    const makeTitle = (): string => {
        if (location.pathname.includes('edit')) return "Edit"
        else if (location.pathname.includes('new')) return "Create"
        else return "ERROR"
    }

    const makeOptions = (): SelectOption[] => {
        let out: SelectOption[] = []
        accessories.forEach(acc => out.push({ label: acc.name, value: acc._id }));
        return out
    }

    const createAccessory = () => {
        const accessoryData: Accessory = {
            _id: window.electron.uuid(),
            name: state.name,
            address: parseInt(state.address),
            device: state.device
        }
        window.electron.invoke('createAccessory', accessoryData as any)
            .then(() => navigate('/system/accessories'))
            .catch((err: unknown) => console.error(err))
    }

    const updateAccessory = () => {
        const accessoryData: Accessory = {
            _id: state._id,
            name: state.name,
            address: parseInt(state.address),
            device: state.device
        }
        window.electron.invoke('updateAccessory', accessoryData as any)
            .then(() => navigate('/system/accessories'))
            .catch((err: unknown) => console.error(err))
    }

    const isCreatable = (): boolean => {
        if (state.name === '' || state.address === '' || isNaN(parseInt(state.address))) return false
        return true
    }

    const isUpdatable = (): boolean => {
        if (!isCreatable()) return false
        if (JSON.stringify(state) === JSON.stringify(ogState)) return false
        return true
    }

    const makeButton = (): React.ReactElement => {
        if (location.pathname.includes("edit")) return <Button variant='success' disabled={!isUpdatable()} size="sm" onClick={updateAccessory}>Update Accessory</Button>
        else if (location.pathname.includes("new")) return <Button variant='success' disabled={!isCreatable()} size="sm" onClick={createAccessory}>Create Accessory</Button>
        else throw new Error('Error in makeButton')
    }

    const makeDeviceInput = (): React.ReactElement | undefined => {
        if (!state.device.name) return undefined

        const makeInputRows = (): React.ReactElement[] => {
            let out: React.ReactElement[] = []
            if (!state.device.actions) return out
            state.device.actions.forEach((act: AccessoryAction, i: number) => {
                out.push(
                    <tr key={`actionRow${i}`}>
                        <td><b>{i}</b></td>
                        <td>
                            <input
                                style={{ 
                                    width: '100%',
                                    backgroundColor: theme.colors.gray[800],
                                    color: theme.colors.light,
                                    border: `1px solid ${theme.colors.gray[600]}`,
                                    borderRadius: theme.borderRadius.sm,
                                    padding: theme.spacing.xs
                                }}
                                value={act.name}
                                placeholder={`Function ${i} name`}
                                onChange={(e) => {
                                    const newActions = [...(state.device.actions || [])]
                                    newActions[i].name = e.target.value
                                    setState(old => {
                                        const newState: AccessoryForm = {
                                            ...old,
                                            device: {
                                                ...old.device,
                                                actions: newActions
                                            }
                                        }
                                        return newState
                                    })
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

    const loadDevice = (id: string): void => {
        let devIDX = accessories.findIndex(acc => acc._id === id)
        if (devIDX < 0) {
            console.error('Device not found')
            return
        }
        setState(old => ({ ...old, device: accessories[devIDX] }))
    }

    const makeValue = (): SelectOption | null => {
        if (!state.device.name) return null
        // Find the device in accessories to get its _id
        const device = accessories.find(acc => acc.name === state.device.name)
        if (device) {
            return { label: device.name, value: device._id }
        }
        return { label: state.device.name, value: state.device.name }
    }

    useEffect(() => {
        if (location.pathname.includes('edit') && accID) {
            window.electron.invoke('getAccessoryByID', accID)
                .then((res: unknown) => {
                    const accessory = res as Accessory
                    if (accessory) {
                        const formData: AccessoryForm = {
                            ...accessory,
                            address: accessory.address.toString()
                        }
                        setState(formData)
                        setOgState(formData)
                    }
                })
                .catch((err: unknown) => console.error(err))
        }
    }, [accID, location.pathname])


    return (
        <div className='pageContainer' >
            <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>{`${makeTitle()} Accessory`}</div>
            <hr style={{ borderColor: theme.colors.gray[600] }} />
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
                                <td>Address</td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder='1234'
                                        value={state.address}
                                        onChange={(e) => setState(old => ({ ...old, address: e.target.value }))}
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
                                <td>Device</td>
                                <td>
                                    <Select
                                        styles={selectStyle}
                                        options={makeOptions()}
                                        value={makeValue()}
                                        onChange={(e: SelectOption | null) => e && loadDevice(e.value as string)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
            {makeDeviceInput()}
            <div style={{ textAlign: 'right' }}>
                <Button variant='secondary' size="sm" style={{ marginRight: theme.spacing.sm }} onClick={() => navigate('/system/accessories')}>Cancel</Button>
                {makeButton()}
            </div>
        </div>
    )
}
