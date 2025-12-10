import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import { Table } from '../../ui';

export default function MacroList() {
    const navigate = useNavigate()
    const [macros, setMacros] = useState([])

    useEffect(() => {
        window.electron.invoke('getMacros')
            .then(res => setMacros(res))
            .catch(err => console.error(err))
    }, [])

    return (
        <div className='pageContainer'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Macro List</b>
                <div style={{ color: 'green', display: 'inline-block', marginLeft: '10px', cursor: 'pointer' }}
                    onClick={() => navigate('/system/macros/new')}
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
                                <th>Edit</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                macros.map((macro, idx) => (
                                    <tr key={`maroRow${idx}`}>
                                        <td>{macro.name}</td>
                                        <td>
                                            <div
                                                style={{ display: 'inline-block', cursor: 'pointer' }}
                                                onClick={() => navigate('/system/macros/edit/' + macro._id)}
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
            </div>
        </div>
    )
}
