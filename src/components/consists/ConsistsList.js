import React, { useEffect, useState } from 'react'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import { useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';

export default function ConsistsList() {
    const navigate = useNavigate()
    const [consists, setConsists] = useState([])

    const makeConsists = () => {
        let out = []

        consists.forEach((consist, i) => {
            out.push(
                <tr key={'consistRow' + i}>
                    <td>
                        {consist.name}
                    </td>
                    <td>
                        {consist.address}
                    </td>
                    <td>
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={() => navigate(`/consists/edit/${consist._id}`)}
                        >
                            <EditTwoToneIcon />
                        </div>
                    </td>
                    <td>
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer', color: 'red' }}
                        >
                            <DeleteForeverTwoToneIcon />
                        </div>
                    </td>
                </tr>
            )
        })

        return out
    }

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getConsists')
            .then(res => setConsists(res))
            .catch(err => console.error(err))
    }, [])

    return (
        <div className='pageContainer'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Consists</b>
                <div
                    style={{ display: 'inline-block', color: 'green', cursor: 'pointer', marginLeft: '10px' }}
                    onClick={() => navigate('/consists/new')}
                >
                    <AddCircleTwoToneIcon />
                </div>
            </div>
            <div>
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {makeConsists()}
                    </tbody>
                </Table>
            </div>
        </div>
    )
}
