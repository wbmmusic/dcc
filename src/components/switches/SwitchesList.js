import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import { Table } from 'react-bootstrap';

export default function SwitchesList() {
    const navigate = useNavigate()
    const [switches, setSwitches] = useState([])

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getSwitches')
            .then(res => {
                console.log(res)
                setSwitches(res)
            })
            .catch(err => console.log(err))
    }, [])

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
                        {
                            switches.map(switchh => (
                                <tr key={switchh._id + "switchRow"}>
                                    <td>{switchh.name}</td>
                                    <td>
                                        <div
                                            style={{ display: 'inline-block', cursor: 'pointer' }}
                                            onClick={() => navigate('/switches/edit/' + switchh._id)}
                                        >
                                            <EditTwoToneIcon />
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'inline-block', cursor: 'pointer', color: 'red' }}>
                                            <DeleteForeverTwoToneIcon />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </div>
        </div >
    )
}
