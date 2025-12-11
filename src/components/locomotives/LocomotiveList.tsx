import React, { useEffect, useState } from 'react'
import { Locomotive, DeleteModalState } from '../../types'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOffTwoToneIcon from '@mui/icons-material/VisibilityOffTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import { Button, Modal, IconButton, useTheme } from '../../ui'
import { useNavigate } from 'react-router-dom';

export default function LocomotiveList() {
    const theme = useTheme()
    const navigate = useNavigate()
    const [locomotives, setLocomotives] = useState<Locomotive[]>([])
    const [searchTerm, setSearchTerm] = useState('')
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

    const handleShowAll = () => {
        const updatedLocos = locomotives.map(loco => ({ ...loco, hidden: false }))
        Promise.all(updatedLocos.map(loco => window.electron.invoke('updateLocomotive', loco)))
            .then(() => setLocomotives(updatedLocos))
    }

    const handleHideAll = () => {
        const updatedLocos = locomotives.map(loco => ({ ...loco, hidden: true }))
        Promise.all(updatedLocos.map(loco => window.electron.invoke('updateLocomotive', loco)))
            .then(() => setLocomotives(updatedLocos))
    }

    const filteredLocomotives = locomotives.filter(loco => 
        loco.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loco.number.toString().includes(searchTerm) ||
        loco.model.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className='pageContainer'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>Locomotives</div>
                <Button variant='secondary' size='sm' onClick={() => navigate('/system/locomotives/new')}>
                    <AddOutlinedIcon style={{ fontSize: '18px', marginRight: '4px' }} />
                    Add Locomotive
                </Button>
            </div>
            
            <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.md, alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search locomotives..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: theme.fontSize.sm,
                        border: `1px solid ${theme.colors.gray[600]}`,
                        borderRadius: theme.borderRadius.sm,
                        backgroundColor: theme.colors.gray[800],
                        color: theme.colors.light
                    }}
                />
                {locomotives.some(loco => loco.hidden) && (
                    <Button variant='secondary' size='sm' onClick={handleShowAll}>Show All</Button>
                )}
                {locomotives.some(loco => !loco.hidden) && (
                    <Button variant='secondary' size='sm' onClick={handleHideAll}>Hide All</Button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: theme.spacing.md }}>
                {
                    filteredLocomotives.map((loco, i) => (
                        <div 
                            key={loco._id + i}
                            style={{
                                backgroundColor: theme.colors.gray[800],
                                border: `1px solid ${theme.colors.gray[600]}`,
                                borderRadius: theme.borderRadius.md,
                                padding: theme.spacing.md,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                                <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>{loco.name}</div>
                                <div style={{ fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.warning }}>{loco.number}</div>
                            </div>
                            <div style={{ 
                                width: '100%', 
                                height: '120px', 
                                marginBottom: theme.spacing.md,
                                border: `2px solid ${theme.colors.gray[600]}`,
                                borderRadius: theme.borderRadius.md,
                                backgroundColor: theme.colors.gray[900],
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img 
                                    src={`loco://${loco.photo || 'default.jpg'}`} 
                                    alt={loco.name}
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '100%', 
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: theme.spacing.md, color: theme.colors.gray[300] }}>
                                <strong>Model:</strong> {loco.model}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                                    <IconButton
                                        color={loco.hidden ? 'secondary' : 'primary'}
                                        onClick={() => {
                                            const updatedLoco = { ...loco, hidden: !loco.hidden }
                                            window.electron.invoke('updateLocomotive', updatedLoco)
                                                .then(() => {
                                                    setLocomotives(prev => prev.map(l => l._id === loco._id ? updatedLoco : l))
                                                })
                                                .catch(err => console.log(err))
                                        }}
                                        title={loco.hidden ? 'Show locomotive' : 'Hide locomotive'}
                                    >
                                        {loco.hidden ? <VisibilityOffTwoToneIcon /> : <VisibilityTwoToneIcon />}
                                    </IconButton>
                                </div>
                                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                                    <IconButton
                                        onClick={() => navigate('/system/locomotives/edit/' + loco._id)}
                                        title="Edit locomotive"
                                    >
                                        <EditOutlinedIcon />
                                    </IconButton>
                                    <IconButton
                                        color="danger"
                                        onClick={() => setDeleteLocoModal({ show: true, id: loco._id })}
                                        title="Delete locomotive"
                                    >
                                        <DeleteForeverIcon />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    ))
                }
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
                {(() => {
                    const loco = locomotives.find(l => l._id === deleteLocoModal.id)
                    return loco ? (
                        <div>
                            <p>Are you sure you want to delete this locomotive?</p>
                            <div style={{ 
                                backgroundColor: theme.colors.gray[700], 
                                padding: theme.spacing.md, 
                                borderRadius: theme.borderRadius.sm,
                                marginTop: theme.spacing.md,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <strong>{loco.name}</strong>
                                <span style={{ color: theme.colors.warning, fontWeight: 'bold' }}>{loco.number}</span>
                            </div>
                        </div>
                    ) : 'Are you sure you want to delete this locomotive?'
                })()} 
            </Modal>
        </div>
    )
}


