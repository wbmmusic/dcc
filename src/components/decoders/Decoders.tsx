import React, { useEffect, useState } from 'react'
import { Decoder, DeleteModalState } from '../../types'
import { Button, Table, Modal, IconButton, useTheme } from '../../ui'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import EditDecoder from './EditDecoder'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

export default function Decoders() {
    const theme = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [decoders, setDecoders] = useState<Decoder[]>([])
    const defaultDeleteModal: DeleteModalState<Decoder> = { show: false, id: '' }
    const [deleteModal, setDeleteModal] = useState<DeleteModalState<Decoder>>(defaultDeleteModal)

    useEffect(() => {
        if (!location.pathname.includes('new') || !location.pathname.includes('edit')) {
            window.electron.invoke('getDecoders')
                .then((res: unknown) => setDecoders(res as Decoder[]))
                .catch((err: unknown) => console.log(err))
        }
    }, [location])

    const makeList = () => {

        const handleClose = () => setDeleteModal(defaultDeleteModal)

        const handleDeleteDecoder = (id: string) => {
            window.electron.invoke('deleteDecoder', id)
                .then((res: unknown) => {
                    setDecoders(res as Decoder[])
                    handleClose()
                })
                .catch((err: unknown) => console.log(err))
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
                            <Button variant="danger" size="sm" onClick={() => deleteModal.entity && handleDeleteDecoder(deleteModal.entity._id)}>Delete</Button>
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
                    <Button variant='secondary' size='sm' onClick={() => navigate('/system/decoders/new')}>
                        <AddOutlinedIcon style={{ fontSize: '18px', marginRight: '4px' }} />
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
                                <th style={{ textAlign: 'center', width: '60px' }}>Edit</th>
                                <th style={{ textAlign: 'center', width: '60px' }}>Del</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                decoders.map((dcdr, i) => (
                                    <tr 
                                        key={`decoder${i + dcdr.name}`}
                                        style={{ transition: 'background-color 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[700]}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td>{dcdr.name}</td>
                                        <td>{dcdr.model}</td>
                                        <td>{dcdr.manufacturer}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <IconButton onClick={() => navigate('/system/decoders/edit/' + dcdr._id)}>
                                                    <EditOutlinedIcon />
                                                </IconButton>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <IconButton color="danger" onClick={() => setDeleteModal({ show: true, id: dcdr._id, entity: dcdr })}>
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