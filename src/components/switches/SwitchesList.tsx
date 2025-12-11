import React, { useEffect, useState } from 'react'
import { Switch } from '../../types'
import { useNavigate } from 'react-router-dom'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Table, Button, IconButton, useTheme } from '../../ui';

export default function SwitchesList() {
    const theme = useTheme()
    const navigate = useNavigate()
    const [switches, setSwitches] = useState<Switch[]>([])

    useEffect(() => {
        window.electron.invoke('getSwitches')
            .then((res: unknown) => {
                console.log(res)
                setSwitches(res as Switch[])
            })
            .catch((err: unknown) => console.log(err))
    }, [])

    return (
        <div className='pageContainer'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                <b>Switches</b>
                <Button variant='secondary' size='sm' onClick={() => navigate('/system/switches/new')}>
                    <AddOutlinedIcon style={{ fontSize: '18px', marginRight: '4px' }} />
                    Add Switch
                </Button>
            </div>
            <div style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)', borderRadius: theme.borderRadius.md, overflow: 'hidden' }}>
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th style={{ textAlign: 'center' }}>Open</th>
                            <th style={{ textAlign: 'center' }}>Close</th>
                            <th style={{ textAlign: 'center', width: '60px' }}>Edit</th>
                            <th style={{ textAlign: 'center', width: '60px' }}>Del</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            switches.map((switchh, idx) => (
                                <tr 
                                    key={(switchh)._id + "switchRow"}
                                    style={{ transition: 'background-color 0.2s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[700]}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td>{switchh.name}</td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant={switchh.state ? 'success' : 'secondary'}
                                            onClick={() => {
                                                window.electron.invoke('setSwitch', switchh._id, 'open')
                                                    .then((res: unknown) => {
                                                        let tempSwitches = [...switches]
                                                        tempSwitches[idx].state = res as boolean
                                                        setSwitches(tempSwitches)
                                                    })
                                                    .catch((err: unknown) => console.log(err))
                                            }}
                                        >Open</Button>
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant={switchh.state ? 'secondary' : 'success'}
                                            onClick={() => {
                                                window.electron.invoke('setSwitch', switchh._id, 'close')
                                                    .then((res: unknown) => {
                                                        let tempSwitches = [...switches]
                                                        tempSwitches[idx].state = res as boolean
                                                        setSwitches(tempSwitches)
                                                    })
                                                    .catch((err: unknown) => console.log(err))
                                            }}
                                        >Close</Button>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <IconButton onClick={() => navigate('/system/switches/edit/' + switchh._id)}>
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
        </div >
    )
}
