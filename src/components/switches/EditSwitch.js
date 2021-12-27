import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button, Table } from 'react-bootstrap'

export default function EditSwitch() {
    const location = useLocation()
    const navigate = useNavigate()
    const theID = useParams().switchID
    console.log(theID)
    const [state, setState] = useState({ name: '', address: Number })


    useEffect(() => {
        if (location.pathname.includes('new')) {

        } else if (location.pathname.includes('edit')) {
            window.electron.ipcRenderer.invoke('getSwitchByID', theID)
                .then(res => setState(res))
                .catch(err => console.log(err))
        } else console.error("Error in use effect")
    }, [theID])


    const makeTitle = () => {
        let out = 'ERROR'
        if (location.pathname.includes('new')) out = 'Create'
        else if (location.pathname.includes('edit')) out = 'Edit'
        return <div><b>{`${out} Switch`}</b></div>
    }

    const createSwitch = () => {
        window.electron.ipcRenderer.invoke('createSwitch', {
            _id: window.electron.uuid(),
            ...state
        })
            .then(() => navigate('/switches'))
            .catch(err => console.log(err))
    }

    const updateSwitch = () => {
        window.electron.ipcRenderer.invoke('updateSwitch', state)
            .then(() => navigate('/switches'))
            .catch(err => console.log(err))
    }

    const makeButtons = () => {

        const makeButton = () => {
            if (location.pathname.includes('new')) {
                return <Button size='sm' onClick={createSwitch}>Create Switch</Button>
            } else if (location.pathname.includes('edit')) {
                return <Button size='sm' onClick={updateSwitch}>Update Switch</Button>
            } else return "ERROR"
        }

        return (
            <div style={{ textAlign: 'right' }}>
                <Button size='sm' onClick={() => navigate('/switches')}>Cancel</Button>
                <div style={{ display: 'inline-block', width: '8px' }} />
                {makeButton()}
            </div>
        )
    }

    return (
        <div>
            {makeTitle()}
            <hr />
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
                                        onChange={(e) => setState(old => ({ ...old, name: e.target.value }))}
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
                                        onChange={(e) => setState(old => ({ ...old, address: parseInt(e.target.value) }))}
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

const labelStyle = { textAlign: 'right' }