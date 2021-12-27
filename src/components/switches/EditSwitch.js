import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Table } from 'react-bootstrap'

export default function EditSwitch() {
    const location = useLocation()
    const navigate = useNavigate()
    const makeTitle = () => {
        let out = 'ERROR'
        if (location.pathname.includes('new')) out = 'Create'
        else if (location.pathname.includes('edit')) out = 'Edit'
        return <div><b>{`${out} Switch`}</b></div>
    }

    const makeButtons = () => {

        const makeButton = () => {
            if (location.pathname.includes('new')) {
                return <Button size='sm'>Create Switch</Button>
            } else if (location.pathname.includes('edit')) {
                return <Button size='sm'>Update Switch</Button>
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
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Address:</td>
                                <td>
                                    <input
                                        type="number"
                                        min={0}
                                        step={1}
                                        placeholder='123'
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