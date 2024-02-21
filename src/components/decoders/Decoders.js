import React, { useEffect, useState } from 'react'
import { Button, Modal, Table } from 'react-bootstrap'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import EditDecoder from './EditDecoder'
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';

export default function Decoders() {
    const navigate = useNavigate()
    const location = useLocation()
    const [decoders, setDecoders] = useState([])
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
                    onHide={handleClose}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete Decoder</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this decoder?
                        <div>
                            <div style={{ display: 'inline-block', padding: '10px', boxShadow: '1px 1px 2px', marginTop: '10px' }}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Name:</td>
                                            <td>{deleteModal.dcdr.name}</td>
                                        </tr>
                                        <tr>
                                            <td>Model:</td>
                                            <td>{deleteModal.dcdr.model}</td>
                                        </tr>
                                        <tr>
                                            <td>Mfr:</td>
                                            <td>{deleteModal.dcdr.manufacturer}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                        <Button variant="danger" onClick={() => handleDeleteDecoder(deleteModal.dcdr._id)}>Delete Decoder</Button>
                    </Modal.Footer>
                </Modal>
            )
        }

        return (
            <div className='pageContainer' >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <b>DECODERS</b>
                    <div
                        style={{ display: 'inline-block', color: 'green', cursor: 'pointer', marginLeft: '10px' }}
                        onClick={() => navigate('/decoders/new')}
                    >
                        <AddCircleTwoToneIcon />
                    </div>
                </div>
                <div style={{ display: 'inline-block' }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Model</th>
                                <th>Mfr</th>
                                <th>Edit</th>
                                <th>Del</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                decoders.map((dcdr, i) => (
                                    <tr key={`decoder${i + dcdr.name}`}>
                                        <td>{dcdr.name}</td>
                                        <td>{dcdr.model}</td>
                                        <td>{dcdr.manufacturer}</td>
                                        <td>
                                            <div
                                                style={{ display: 'inline-block', cursor: 'pointer' }}
                                                onClick={() => {
                                                    console.log(dcdr._id)
                                                    navigate('/decoders/edit/' + dcdr._id)
                                                }}
                                            >
                                                <EditTwoToneIcon />
                                            </div>
                                        </td>
                                        <td>
                                            <div
                                                style={{ display: 'inline-block', cursor: 'pointer', color: 'red' }}
                                                onClick={() => setDeleteModal({ show: true, dcdr: dcdr })}
                                            >
                                                <DeleteForeverTwoToneIcon />
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