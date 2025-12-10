import React, { useEffect, useState } from 'react'
import { Decoder } from '../../types'
import { Button, Table, Modal, useTheme } from '../../ui'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import EditDecoder from './EditDecoder.jsx'
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';

export default function Decoders() {
    const theme = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [decoders, setDecoders] = useState<Decoder[]>([])
    const defaultDeleteModal = { show: false, dcdr: {} }
    const [deleteModal, setDeleteModal] = useState(defaultDeleteModal)

    useEffect(() => {
        if (!location.pathname.includes('new') || !location.pathname.includes('edit')) {
            window.electron.invoke('getDecoders')
                .then(res => setDecoders(res))
                .catch(err => console.log(err))
        }
    }, [location])

    const makeList = () => {

        const handleClose = () => setDeleteModal(defaultDeleteModal)

        const handleDeleteDecoder = (id) => {
            window.electron.invoke('deleteDecoder', id)
                .then(res => {
                    setDecoders(res)
                    handleClose()
                })
                .catch(err => console.log(err))
        }

        const makeDeleteModal = () => {
            return (
                <Modal
                    show={deleteModal.show}
                    onClose={handleClose}
                    title="Delete Decoder"
                    footer={
                        <>
                            <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteDecoder(deleteModal.dcdr._id)}>Delete</Button>
                        </>
                    }
                >
                    Are you sure you want to delete this decoder?
                </Modal>
            )
        }

        return (
            <div className='pageContainer' >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                    <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>Decoders</div>
                    <Button size='sm' onClick={() => navigate('/system/decoders/new')}>
                        <AddCircleTwoToneIcon style={{ fontSize: '18px', marginRight: '4px' }} />
                        Add Decoder
                    </Button>
                </div>

                <div style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)', borderRadius: theme.borderRadius.md, overflow: 'hidden' }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Model</th>
                                <th>Manufacturer</th>
                                <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                decoders.map((dcdr, i) => (
                                    <tr 
                                        key={`decoder${i + dcdr.name}`}
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[700]}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        onClick={() => navigate('/system/decoders/edit/' + dcdr._id)}
                                    >
                                        <td>{dcdr.name}</td>
                                        <td>{dcdr.model}</td>
                                        <td>{dcdr.manufacturer}</td>
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
                                                onClick={() => navigate('/system/decoders/edit/' + dcdr._id)}
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
                                                onClick={() => setDeleteModal({ show: true, dcdr: dcdr })}
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
                {makeDeleteModal()}
            </div>
        )
    }

    return (
        <div style={{ height: '100%', overflow: 'hidden', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px' }}>
                <Routes>
                    <Route path="/" element={makeList()} />
                    <Route path='/new' element={(<EditDecoder />)} />
                    <Route path='/edit/:decoderID' element={(<EditDecoder />)} />
                </Routes>
            </div>
        </div>

    )
}