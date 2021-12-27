import React, { useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'

export default function EditMacro() {
    const location = useLocation()
    const navigate = useNavigate()
    const [state, setState] = useState({
        name: ''
    })

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
                return <Button size='sm'>Create Macro</Button>
            } else if (location.pathname.includes('edit')) {
                return <Button size='sm'>Update Macro</Button>
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

    return (
        <div>
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
