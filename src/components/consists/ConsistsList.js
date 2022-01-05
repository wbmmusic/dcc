import React, { useEffect, useState } from 'react'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Table } from 'react-bootstrap';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';

export default function ConsistsList() {
    const navigate = useNavigate()
    const [consists, setConsists] = useState([])
    const defaultDeleteModal = { show: false, id: '' }
    const [deleteModal, setDeleteModal] = useState(defaultDeleteModal)

    const makeConsists = () => {
        let out = []

        consists.forEach((consist, i) => {
            out.push(
                <tr key={'consistRow' + i}>
                    <td>
                        <input
                            type="checkbox"
                            checked={consist.enabled}
                            onClick={() => {
                                window.electron.ipcRenderer.invoke('toggleConsist', consist._id)
                                    .then(res => setConsists(res))
                                    .catch(err => console.error(err))
                            }}
                        />
                    </td>
                    <td>
                        {consist.name}
                    </td>
                    <td>
                        {consist.address}
                    </td>
                    <td>
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={() => navigate(`/consists/edit/${consist._id}`)}
                        >
                            <EditTwoToneIcon />
                        </div>
                    </td>
                    <td>
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer', color: 'red' }}
                            onClick={() => setDeleteModal({ show: true, consist: consist })}
                        >
                            <DeleteForeverTwoToneIcon />
                        </div>
                    </td>
                </tr >
            )
        })

        return out
    }

    const handleClose = () => setDeleteModal(defaultDeleteModal)

    const deleteConsist = (id) => {
        window.electron.ipcRenderer.invoke('deleteConsist', id)
            .then(res => {
                setConsists(res)
                handleClose()
            })
            .catch(err => console.error(err))
    }

    const makeDeleteModal = () => {
        if (deleteModal.show) {
            return (
                <Modal
                    show={deleteModal.show}
                    onHide={handleClose}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Consist</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete consist <b>{deleteModal.consist.name}</b>?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" onClick={handleClose}>Cancel</Button>
                        <Button variant="danger" onClick={() => deleteConsist(deleteModal.consist._id)}>Delete Consist</Button>
                    </Modal.Footer>
                </Modal>
            )
        }
    }

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getConsists')
            .then(res => setConsists(res))
            .catch(err => console.error(err))
    }, [])

    return (
        <div className='pageContainer'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Consists</b>
                <div
                    style={{ display: 'inline-block', color: 'green', cursor: 'pointer', marginLeft: '10px' }}
                    onClick={() => navigate('/consists/new')}
                >
                    <AddCircleTwoToneIcon />
                </div>
            </div>
            <div>
                <Table>
                    <thead>
                        <tr>
                            <th>En</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {makeConsists()}
                    </tbody>
                </Table>
            </div>
            {makeDeleteModal()}
        </div>
    )
}
