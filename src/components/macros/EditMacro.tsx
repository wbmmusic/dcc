import React, { useEffect, useState } from 'react'
import { Button, Table, Modal, useTheme } from '../../ui'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import { selectStyle } from '../../styles'
import { Macro, Switch, MacroAction } from '../../types'

interface ActionModal {
    show: boolean;
    handle: string;
    action: MacroAction;
}

export default function EditMacro() {
    const theme = useTheme()
    const location = useLocation()
    const navigate = useNavigate()
    const macroID = useParams().macroID
    const [state, setState] = useState<Partial<Macro>>({ name: '', actions: [] })
    const [ogState, setOgState] = useState<Partial<Macro> | null>(null)
    const [switches, setSwitches] = useState<Switch[]>([])
    const [loading, setLoading] = useState(false)
    const defaultActionModal: ActionModal = { show: false, handle: '', action: { switch: '', state: 'open' } }
    const [actionModal, setActionModal] = useState<ActionModal>(defaultActionModal)

    const createMacro = async () => {
        setLoading(true)
        try {
            const macroData: Macro = {
                _id: window.electron.uuid(),
                name: state.name || '',
                actions: state.actions || []
            }
            await window.electron.invoke('createMacro', macroData as any)
            navigate('/system/macros')
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const updateMacro = async () => {
        setLoading(true)
        try {
            await window.electron.invoke('updateMacro', state)
            navigate('/system/macros')
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const makeTitle = (): string => {
        if (location.pathname.includes('new')) {
            return "Create"
        } else if (location.pathname.includes('edit')) {
            return "Edit"
        }
        return "ERROR"
    }

    const isCreatable = (): boolean => {
        return (state.name || '').trim() !== ''
    }

    const isUpdatable = (): boolean => {
        if (!isCreatable()) return false
        return JSON.stringify(state) !== JSON.stringify(ogState)
    }

    const makeButtons = () => {
        const makeButton = () => {
            if (location.pathname.includes('new')) {
                return <Button variant='success' size='sm' disabled={!isCreatable()} loading={loading} onClick={createMacro}>Create Macro</Button>
            } else if (location.pathname.includes('edit')) {
                return <Button variant='success' size='sm' disabled={!isUpdatable()} loading={loading} onClick={updateMacro}>Update Macro</Button>
            } else return "ERROR"
        }

        return (
            <div style={{ textAlign: 'right' }}>
                <Button variant='secondary' size='sm' onClick={() => navigate('/system/macros')}>Cancel</Button>
                <div style={{ display: 'inline-block', width: theme.spacing.sm }} />
                {makeButton()}
            </div>
        )
    }

    const addAction = () => {
        setState(old => ({ ...old, actions: [...(old.actions || []), actionModal.action] }))
        setActionModal(defaultActionModal)
    }

    const updateAction = () => {

    }

    const getSwitchName = (id: string): string => {
        const switchID = switches.findIndex(sw => sw._id === id)
        if (switchID >= 0) return switches[switchID].name
        else return "ERROR"
    }

    const closeActionModal = () => setActionModal(defaultActionModal)

    const makeActionModal = (): React.ReactElement | undefined => {
        if (actionModal.show) {

            const makeButton = (): React.ReactElement | undefined => {
                if (actionModal.handle === 'Add') return <Button variant="primary" onClick={addAction}>Add</Button>
                else if (actionModal.handle === 'Edit') return <Button variant="primary" onClick={updateAction}>Update</Button>
                return undefined
            }

            const makeSwitchOptions = () => {
                let out: { label: string; value: string }[] = []
                switches.forEach(swch => out.push({ label: swch.name, value: swch._id }))
                return out
            }

            const makeSwitchValue = () => {
                if (actionModal.action.switch === '') return null
                let theSwitch = switches.find(sw => sw._id === actionModal.action.switch)
                return theSwitch ? { label: theSwitch.name, value: theSwitch._id } : null
            }

            const showUnderSwitch = (): React.ReactElement | undefined => {
                if (actionModal.action.switch !== '') {
                    return (
                        <tr>
                            <td>Set</td>
                            <td>
                                <div style={{ display: 'flex', gap: '0' }}>
                                    <Button
                                        size="sm"
                                        variant={actionModal.action.state === 'open' ? 'primary' : 'secondary'}
                                        onClick={() => setActionModal(old => ({ ...old, action: { ...old.action, state: 'open' } }))}
                                        style={{ borderRadius: '4px 0 0 4px' }}
                                    >Open</Button>
                                    <Button
                                        size="sm"
                                        variant={actionModal.action.state === 'close' ? 'primary' : 'secondary'}
                                        onClick={() => setActionModal(old => ({ ...old, action: { ...old.action, state: 'close' } }))}
                                        style={{ borderRadius: '0 4px 4px 0' }}>
                                        Close</Button>
                                </div>
                            </td>
                        </tr>
                    )
                }
                return undefined
            }

            return (
                <Modal
                    show={actionModal.show}
                    onClose={closeActionModal}
                    title={`${actionModal.handle} Action`}
                    footer={
                        <>
                            <Button variant="secondary" onClick={closeActionModal}>Cancel</Button>
                            {makeButton()}
                        </>
                    }
                >
                    <div>
                        <div style={{ display: 'inline-block' }}>
                            <Table size='sm'>
                                <tbody>
                                    <tr>
                                        <td>Switch</td>
                                        <td>
                                            <Select
                                                styles={selectStyle}
                                                options={makeSwitchOptions()}
                                                value={makeSwitchValue()}
                                                onChange={(e: any) => {
                                                    if (e) {
                                                        setActionModal(old => ({ ...old, action: { ...old.action, switch: e.value || '' } }))
                                                    }
                                                }}
                                            />
                                        </td>
                                    </tr>
                                    {showUnderSwitch()}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </Modal>
            )
        }
        return undefined
    }

    const makeActions = (): React.ReactElement[] => {
        const actions = state.actions || []
        return actions.map((act: MacroAction, i: number) => (
            <tr key={`actionRow${i}`}>
                <td>{getSwitchName(act.switch)}</td>
                <td>{act.state}</td>
            </tr>
        ))
    }

    useEffect(() => {
        if (macroID) {
            window.electron.invoke('getMacroByID', macroID)
                .then((res: unknown) => {
                    const macro = res as Macro
                    setState(macro)
                    setOgState(macro)
                })
                .catch((err: unknown) => console.error(err))
        }

        window.electron.invoke('getSwitches')
            .then((res: unknown) => setSwitches(res as Switch[]))
            .catch((err: unknown) => console.error(err))

    }, [])


    return (
        <div className='pageContainer'>
            <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>{`${makeTitle()} Macro`}</div>
            <hr style={{ borderColor: theme.colors.gray[600] }} />
            <div style={{
                backgroundColor: theme.colors.gray[800],
                border: `1px solid ${theme.colors.gray[600]}`,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                marginBottom: theme.spacing.md
            }}>
                <div style={{ display: 'inline-block' }}>
                    <Table size='sm' >
                        <tbody>
                            <tr>
                                <td>Name:</td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder='Macro Name'
                                        value={state.name}
                                        onChange={(e) => setState((old: Partial<Macro>) => ({ ...old, name: e.target.value }))}
                                        style={{
                                            backgroundColor: theme.colors.gray[700],
                                            color: theme.colors.light,
                                            border: `1px solid ${theme.colors.gray[500]}`,
                                            borderRadius: theme.borderRadius.sm,
                                            padding: theme.spacing.xs
                                        }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
            <Button size='sm' onClick={() => setActionModal(old => ({ ...old, show: true, handle: 'Add' }))}>Add Action</Button>
            <div style={{
                backgroundColor: theme.colors.gray[800],
                border: `1px solid ${theme.colors.gray[600]}`,
                borderRadius: theme.borderRadius.md,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                marginBottom: theme.spacing.md
            }}>
                <div style={{ display: 'inline-block' }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Switch</th>
                                <th>State</th>
                            </tr>
                        </thead>
                        <tbody>
                            {makeActions()}
                        </tbody>
                    </Table>
                </div>
            </div>
            <hr style={{ borderColor: theme.colors.gray[600] }} />
            {makeButtons()}
            {makeActionModal()}
        </div>
    )
}
