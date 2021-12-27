import React from 'react'
import { useNavigate } from 'react-router-dom'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import { Table } from 'react-bootstrap';

export default function SwitchesList() {
    const navigate = useNavigate()
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Switches</b>
                <div
                    style={{ color: 'green', display: 'inline-block', cursor: 'pointer', marginLeft: '10px' }}
                    onClick={() => navigate('/switches/new')}
                >
                    <AddCircleTwoToneIcon />
                </div>
            </div>
            <div style={{ display: 'inline-block' }} >
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Edit</th>
                            <th>Del</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Some Name</td>
                            <td>
                                <div style={{ display: 'inline-block', cursor: 'pointer' }}>
                                    <EditTwoToneIcon />
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'inline-block', cursor: 'pointer', color: 'red' }}>
                                    <DeleteForeverTwoToneIcon />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        </div>
    )
}
