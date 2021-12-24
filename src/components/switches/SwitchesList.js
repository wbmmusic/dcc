import React from 'react'
import { useNavigate } from 'react-router-dom'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
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
                            <td>XX</td>
                            <td>XX</td>
                            <td>XX</td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        </div>
    )
}
