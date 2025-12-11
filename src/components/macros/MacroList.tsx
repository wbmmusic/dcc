import React, { useEffect, useState } from 'react'
import { Macro } from '../../types'
import { useNavigate } from 'react-router-dom'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Table, Button, IconButton, useTheme } from '../../ui';

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
                    <AddOutlinedIcon style={{ fontSize: '18px', marginRight: '4px' }} />
                    Add Macro
                </Button>
            </div>
            <div>
                <div style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)', borderRadius: theme.borderRadius.md, overflow: 'hidden' }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th style={{ textAlign: 'center', width: '60px' }}>Edit</th>
                                <th style={{ textAlign: 'center', width: '60px' }}>Del</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                macros.map((macro, idx) => (
                                    <tr 
                                        key={`maroRow${idx}`}
                                        style={{ transition: 'background-color 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[700]}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td>{macro.name}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <IconButton onClick={() => navigate('/system/macros/edit/' + macro._id)}>
                                                    <EditOutlinedIcon />
                                                </IconButton>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <IconButton color="danger">
                                                    <DeleteForeverIcon />
                                                </IconButton>
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
