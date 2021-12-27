import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, Modal, Table } from 'react-bootstrap'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import { selectStyle } from '../../styles'

export default function EditMacro() {
    const location = useLocation()
    const navigate = useNavigate()
    const macroID = useParams().macroID
    const [state, setState] = useState({ name: '', actions: [] })
    const [switches, setSwitches] = useState([])
    const defaultActionModal = { show: false, handle: '', action: { switch: '', state: 'open' } }
    const [actionModal, setActionModal] = useState(defaultActionModal)

    const createMacro = () => {
        window.electron.ipcRenderer.invoke('createMacro', { _id: window.electron.uuid(), ...state })
            .then(res => navigate('/macros'))
            .catch(err => console.error(err))
    }

    const updateMacro = () => {
        window.electron.ipcRenderer.invoke('updateMacro', state)
            .then(res => navigate('/macros'))
            .catch(err => console.error(err))
    }

    const makeTitle = () => {
        if (location.pathname.includes('new')) {
            return "Create"
        } else if (location.pathname.includes('edit')) {
            return "Edit"
        } else return "ERROR"
    }

    const makeButtons = () => {
        const makeButton = () => {
            if (location.pathname.includes('new')) {
                return <Button size='sm' onClick={createMacro}>Create Macro</Button>
            } else if (location.pathname.includes('edit')) {
                return <Button size='sm' onClick={updateMacro}>Update Macro</Button>
            } else return "ERROR"
        }

        return (
            <div style={{ textAlign: 'right' }}>
                <Button size='sm' onClick={() => navigate('/macros')}>Cancel</Button>
                <div style={{ display: 'inline-block', width: '8px' }} />
                {makeButton()}
            </div>
        )
    }

    const addAction = () => {
        setState(old => ({ ...old, actions: [...old.actions, actionModal.action] }))
        setActionModal(defaultActionModal)
    }

    const updateAction = () => {

    }

    const getSwitchName = (id) => {
        const switchID = switches.findIndex(sw => sw._id === id)
        if (switchID >= 0) return switches[switchID].name
        else return "ERROR"
    }

    const closeActionModal = () => setActionModal(defaultActionModal)

    const constMakeActionModal = () => {
        if (actionModal.show) {

            const makeButton = () => {
                if (actionModal.handle === 'Add') return <Button variant="primary" onClick={addAction}>Add</Button>
                else if (actionModal.handle === 'Edit') return <Button variant="primary" onClick={updateAction}>Update</Button>
            }

            const makeSwitchOptions = () => {
                let out = []
                switches.forEach(swch => out.push({ label: swch.name, value: swch._id }))
                return out
            }

            const makeSwitchValue = () => {
                if (actionModal.action.switch === '') return null
                let theSwitch = switches.find(sw => sw._id === actionModal.action.switch)
                return { label: theSwitch.name, value: theSwitch._id }
            }

            const showUnderSwitch = () => {
                if (actionModal.action.switch !== '') {
                    return (
                        <tr>
                            <td>Set</td>
                            <td>
                                <ButtonGroup size="sm">
                                    <Button
                                        variant={actionModal.action.state === 'open' ? 'primary' : 'secondary'}
                                        onClick={() => setActionModal(old => ({ ...old, action: { ...old.action, state: 'open' } }))}
                                    >Open</Button>
                                    <Button
                                        variant={actionModal.action.state === 'close' ? 'primary' : 'secondary'}
                                        onClick={() => setActionModal(old => ({ ...old, action: { ...old.action, state: 'close' } }))}>
                                        Close</Button>
                                </ButtonGroup>
                            </td>
                        </tr>
                    )
                }
            }

            return (
                <Modal
                    show={actionModal.show}
                    onHide={closeActionModal}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{`${actionModal.handle} Action`}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
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
                                                    onChange={(e) => setActionModal(old => ({ ...old, action: { ...old.action, switch: e.value } }))}
                                                />
                                            </td>
                                        </tr>
                                        {showUnderSwitch()}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeActionModal}>Cancel</Button>
                        {makeButton()}
                    </Modal.Footer>
                </Modal>
            )
        }
    }

    const makeActions = () => {
        let out = []

        state.actions.forEach((act, i) => {
            out.push(
                <tr key={`actionRow${i}`}>
                    <td>{getSwitchName(act.switch)}</td>
                    <td>{act.state}</td>
                </tr>
            )
        })

        return out
    }

    useEffect(() => {
        if (macroID) {
            window.electron.ipcRenderer.invoke('getMacroByID', macroID)
                .then(res => {
                    console.log(res)
                    setState(res)
                })
                .catch(err => console.error(err))
        }

        window.electron.ipcRenderer.invoke('getSwitches')
            .then(res => setSwitches(res))
            .catch(err => console.error(err))

    }, [])


    return (
        <div className='pageContainer'>
            <b>{`${makeTitle()} Macro`}</b>
            <hr />
            <div>
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
                                        onChange={(e) => setState(old => ({ ...old, name: e.target.value }))}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
            <Button size='sm' onClick={() => setActionModal(old => ({ ...old, show: true, handle: 'Add' }))}>Add Action</Button>
            <div>
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
            <hr />
            {makeButtons()}
            {constMakeActionModal()}
        </div>
    )
}
