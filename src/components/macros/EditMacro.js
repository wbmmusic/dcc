import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export default function EditMacro() {
    const location = useLocation()
    const navigate = useNavigate()
    const macroID = useParams().macroID
    const [state, setState] = useState({ name: '' })

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

    useEffect(() => {
        if (macroID) {
            window.electron.ipcRenderer.invoke('getMacroByID', macroID)
                .then(res => {
                    console.log(res)
                    setState(res)
                })
                .catch(err => console.error(err))
        }
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
            <hr />
            {makeButtons()}
        </div>
    )
}
