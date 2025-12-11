import React, { useEffect, useState } from 'react'
import { Macro } from '../../types'
import { useNavigate } from 'react-router-dom'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import { Table, Button, useTheme } from '../../ui';

export default function MacroList() {
    const theme = useTheme()
    const navigate = useNavigate()
    const [macros, setMacros] = useState<Macro[]>([])

    useEffect(() => {
        window.electron.invoke('getMacros')
            .then((res: unknown) => setMacros(res as Macro[]))
            .catch((err: unknown) => console.error(err))
    }, [])

    return (
        <div className='pageContainer'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                <b>Macro List</b>
                <Button variant='secondary' size='sm' onClick={() => navigate('/system/macros/new')}>
                    <AddCircleTwoToneIcon style={{ fontSize: '18px', marginRight: '4px' }} />
                    Add Macro
                </Button>
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
