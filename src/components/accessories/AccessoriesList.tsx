import React, { useEffect, useState } from 'react'
import { Accessory } from '../../types'
import { Table, Button, IconButton, useTheme } from '../../ui'
import { useNavigate } from 'react-router-dom'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export default function AccessoriesList() {
    const theme = useTheme()
    const navigate = useNavigate()
    const [accessories, setAccessories] = useState<Accessory[]>([])

    const deleteAccessory = (id: string) => {
        window.electron.invoke('deleteAccessory', id)
            .then((res: unknown) => setAccessories(res as Accessory[]))
            .catch((err: unknown) => console.error(err))
    }

    const makeAccessories = (): React.ReactElement[] => {
        let out: React.ReactElement[] = []
        accessories.forEach((acc, i) => {
            out.push(
                <tr 
                    key={`accRow${i}`}
                    style={{ transition: 'background-color 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[700]}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <td>{acc.name}</td>
                    <td>{acc.device.name}</td>
                    <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton onClick={() => navigate('/system/accessories/edit/' + acc._id)}>
                                <EditOutlinedIcon />
                            </IconButton>
                        </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton color="danger" onClick={() => deleteAccessory(acc._id)}>
                                <DeleteForeverIcon />
                            </IconButton>
                        </div>
                    </td>
                </tr>
            )
        })
        return out
    }

    useEffect(() => {
        window.electron.invoke('getAccessories')
            .then((res: unknown) => setAccessories(res as Accessory[]))
            .catch((err: unknown) => console.error(err))
    }, [])

    return (
        <div className="pageContainer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                <b>Accessories</b>
                <Button variant='secondary' size='sm' onClick={() => navigate('/system/accessories/new')}>
                    <AddOutlinedIcon style={{ fontSize: '18px', marginRight: '4px' }} />
                    Add Accessory
                </Button>
            </div>
            <div>
                <div style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)', borderRadius: theme.borderRadius.md, overflow: 'hidden' }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Device</th>
                                <th style={{ textAlign: 'center', width: '60px' }}>Edit</th>
                                <th style={{ textAlign: 'center', width: '60px' }}>Del</th>
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
