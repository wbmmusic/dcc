import React, { useEffect, useState } from 'react'
import { Locomotive, DeleteModalState } from '../../types'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import { Button, Table, Modal, useTheme } from '../../ui'
import { useNavigate } from 'react-router-dom';

export default function LocomotiveList() {
    const theme = useTheme()
    const navigate = useNavigate()
    const [locomotives, setLocomotives] = useState<Locomotive[]>([])
    const defaultDeleteModal: DeleteModalState<Locomotive> = { show: false, id: '' }
    const [deleteLocoModal, setDeleteLocoModal] = useState<DeleteModalState<Locomotive>>(defaultDeleteModal)

    useEffect(() => {
        window.electron.invoke('getLocomotives')
            .then((locos: unknown) => setLocomotives(locos as Locomotive[]))
            .catch((err: unknown) => console.log(err))
    }, [])

    const handleDeleteLoco = (id: string) => {
        window.electron.invoke('deleteLocomotive', id)
            .then((locos: unknown) => {
                console.log(locos)
                setLocomotives(locos as Locomotive[])
                setDeleteLocoModal(defaultDeleteModal)
            })
            .catch((err: unknown) => console.log(err))
    }

    const handleClose = () => setDeleteLocoModal(defaultDeleteModal)

    return (
        <div className='pageContainer'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>Locomotives</div>
                <Button variant='secondary' size='sm' onClick={() => navigate('/system/locomotives/new')}>
                    <AddCircleTwoToneIcon style={{ fontSize: '18px', marginRight: '4px' }} />
                    Add Locomotive
                </Button>
            </div>

            <div style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)', borderRadius: theme.borderRadius.md, overflow: 'hidden' }}>
                <Table>
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>Photo</th>
                            <th>Name</th>
                            <th style={{ width: '100px' }}>#</th>
                            <th>Model</th>
                            <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            locomotives.map((loco, i) => (
                                <tr 
                                    key={loco._id + i}
                                    style={{ cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[700]}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    onClick={() => navigate('/system/locomotives/edit/' + loco._id)}
                                >
                                    <td>
                                        <img 
                                            src={`loco://${loco.photo || 'default.jpg'}`} 
                                            alt={loco.name}
                                            style={{ 
                                                width: '60px', 
                                                height: '40px', 
                                                objectFit: 'contain',
                                                border: `1px solid ${theme.colors.gray[600]}`,
                                                borderRadius: theme.borderRadius.sm,
                                                backgroundColor: theme.colors.gray[900],
                                                padding: theme.spacing.xs
                                            }}
                                        />
                                    </td>
                                    <td>{loco.name}</td>
                                    <td style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.warning }}>{loco.number}</td>
                                    <td>{loco.model}</td>
                                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                        <span
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: theme.spacing.xs,
                                                marginRight: theme.spacing.xs,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px',
                                                borderRadius: theme.borderRadius.sm,
                                                transition: 'transform 0.2s ease'
                                            }}
                                            onClick={() => navigate('/system/locomotives/edit/' + loco._id)}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <EditTwoToneIcon style={{ fontSize: '20px' }} />
                                        </span>
                                        <span
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: theme.spacing.xs,
                                                marginRight: theme.spacing.xs,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px',
                                                borderRadius: theme.borderRadius.sm,
                                                color: theme.colors.danger,
                                                transition: 'transform 0.2s ease'
                                            }}
                                            onClick={() => setDeleteLocoModal({ show: true, id: loco._id })}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <DeleteForeverTwoToneIcon style={{ fontSize: '20px' }} />
                                        </span>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </div>

            <Modal
                show={deleteLocoModal.show}
                onClose={handleClose}
                title="Delete Locomotive"
                footer={
                    <>
                        <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteLoco(deleteLocoModal.id)}>Delete</Button>
                    </>
                }
            >
                Are you sure you want to delete this locomotive?
            </Modal>
        </div>
    )
}


