import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';

export default function AccessoriesList() {
    const navigate = useNavigate()
    const [accessories, setAccessories] = useState([])

    const deleteAccessory = (id) => {
        window.electron.invoke('deleteAccessory', id)
            .then(res => setAccessories(res))
            .catch(err => console.error(err))
    }

    const makeAccessories = () => {
        let out = []
        accessories.forEach((acc, i) => {
            out.push(
                <tr key={`accRow${i}`}>
                    <td>{acc.name}</td>
                    <td>{acc.device.name}</td>
                    <td>
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={() => navigate('/accessories/edit/' + acc._id)}
                        >
                            <EditTwoToneIcon />
                        </div>
                    </td>
                    <td>
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer', color: 'red' }}
                            onClick={() => deleteAccessory(acc._id)}
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
        window.electron.invoke('getAccessories')
            .then(res => setAccessories(res))
            .catch(err => console.error(err))
    }, [])

    return (
        <div className="pageContainer">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Accessories</b>
                <div
                    style={{ display: 'inline-block', color: 'green', marginLeft: '10px', cursor: 'pointer' }}
                    onClick={() => navigate('/accessories/new')}
                >
                    <AddCircleTwoToneIcon />
                </div>
            </div>
            <div>
                <div style={{ display: 'inline-block' }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Device</th>
                                <th>Edit</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {makeAccessories()}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
