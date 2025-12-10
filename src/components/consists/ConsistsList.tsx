import React, { useEffect, useState } from 'react'
import { Consist } from '../../types'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Modal } from '../../ui'

import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';

export default function ConsistsList() {
    const navigate = useNavigate()
    const [consists, setConsists] = useState<Consist[]>([])
    const [locos, setLocos] = useState([])
    const defaultDeleteModal = { show: false, id: '' }
    const [deleteModal, setDeleteModal] = useState(defaultDeleteModal)

    const toggleConsist = (id) => {
        window.electron.invoke('toggleConsist', id)
            .then(res => setConsists(res))
            .catch(err => console.error(err))
    }

    const getLocoName = (id) => {
        const locoIDX = locos.findIndex(loco => loco._id === id)
        if (locoIDX !== -1) {
            return `${locos[locoIDX].name} ${locos[locoIDX].number}`
        } else return 'ERROR'
    }

    const makeLocoNames = (theLocos) => {
        let out = []
        theLocos.forEach((loco, i) => {
            out.push(
                <div key={`locoInTbl${i}`}>
                    {getLocoName(loco._id)}
                </div>
            )
        })
        return out
    }

    const makeConsists = () => {
        let out = []

        consists.forEach((consist, i) => {
            out.push(
                <tr key={'consistRow' + i}>
                    <td>
                        <input
                            type="checkbox"
                            checked={consist.enabled}
                            onChange={() => toggleConsist(consist._id)}
                        />
                    </td>
                    <td>
                        {consist.name}
                    </td>
                    <td>
                        {consist.address}
                    </td>
                    <td>{makeLocoNames(consist.locos)}</td>
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
        window.electron.invoke('deleteConsist', id)
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
                    onClose={handleClose}
                    title="Delete Consist"
                    footer={
                        <>
                            <Button variant="success" onClick={handleClose}>Cancel</Button>
                            <Button variant="danger" onClick={() => deleteConsist(deleteModal.consist._id)}>Delete Consist</Button>
                        </>
                    }
                >
                    Are you sure you want to delete consist <b>{deleteModal.consist.name}</b>?
                </Modal>
            )
        }
    }

    useEffect(() => {
        window.electron.invoke('getConsists')
            .then(res => setConsists(res))
            .catch(err => console.error(err))

        window.electron.invoke('getLocomotives')
            .then(res => setLocos(res))
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
                            <th>Locos</th>
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
