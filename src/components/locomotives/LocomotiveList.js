import React, { useEffect, useState } from 'react'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import { Button, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function LocomotiveList() {
    const navigate = useNavigate()
    const [locomotives, setLocomotives] = useState([])
    const defaultDeleteModal = { show: false, id: '' }
    const [deleteLocoModal, setDeleteLocoModal] = useState(defaultDeleteModal)

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getLocomotives')
            .then(locos => setLocomotives(locos))
            .catch(err => console.log(err))
    }, [])

    const handleDeleteLoco = (id) => {
        window.electron.ipcRenderer.invoke('deleteLocomotive', id)
            .then(locos => {
                console.log(locos)
                setLocomotives(locos)
                setDeleteLocoModal(defaultDeleteModal)
            })
            .catch(err => console.log(err))
    }

    const makeDeleteModal = () => {
        const handleClose = () => setDeleteLocoModal(defaultDeleteModal)

        if (deleteLocoModal.show) {
            return (
                <Modal
                    show={deleteLocoModal.show}
                    onHide={handleClose}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Locomotive</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this Locomotive?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleDeleteLoco(deleteLocoModal.id)}
                        >Delete Locomotive</Button>
                    </Modal.Footer>
                </Modal>
            )
        }
    }

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Locomotives</b>
                <div
                    style={{ display: 'inline-block', cursor: 'pointer', color: 'green', marginLeft: '10px' }}
                    onClick={() => navigate('/locomotives/new')}
                >
                    <AddCircleTwoToneIcon />
                </div>
            </div>
            <div>
                <div style={{ display: 'inline-block' }}>
                    <Table striped>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>#</th>
                                <th>Addr</th>
                                <th>Model</th>
                                <th>Edit</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                locomotives.map((loco, i) => (
                                    <tr key={loco._id + i}>
                                        <td>{loco.name}</td>
                                        <td>{loco.number}</td>
                                        <td>{loco.address}</td>
                                        <td>{loco.model}</td>
                                        <td>
                                            <div
                                                style={{ display: 'inline-block', cursor: 'pointer' }}
                                                onClick={() => navigate('/locomotives/edit/' + loco._id)}
                                            >
                                                <EditTwoToneIcon />
                                            </div>
                                        </td>
                                        <td>
                                            <div
                                                style={{ display: 'inline-block', cursor: 'pointer', color: 'red' }}
                                                onClick={() => setDeleteLocoModal({ show: true, id: loco._id })}
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
            </div>
            {makeDeleteModal()}
        </div>
    )
}
