import React, { useEffect, useState } from 'react'
import { Consist, Locomotive, ConsistLoco, DeleteModalState } from '../../types'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Modal } from '../../ui'

import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';

export default function ConsistsList() {
    const navigate = useNavigate()
    const [consists, setConsists] = useState<Consist[]>([])
    const [locos, setLocos] = useState<Locomotive[]>([])
    const defaultDeleteModal: DeleteModalState<Consist> = { show: false, id: '' }
    const [deleteModal, setDeleteModal] = useState<DeleteModalState<Consist>>(defaultDeleteModal)

    const toggleConsist = (id: string) => {
        window.electron.invoke('toggleConsist', id)
            .then((res: unknown) => setConsists(res as Consist[]))
            .catch((err: unknown) => console.error(err))
    }

    const getLocoName = (id: string): string => {
        const locoIDX = locos.findIndex(loco => loco._id === id)
        if (locoIDX !== -1) {
            return `${locos[locoIDX].name} ${locos[locoIDX].number}`
        } else return 'ERROR'
    }

    const makeLocoNames = (theLocos: ConsistLoco[]): React.ReactElement[] => {
        let out: React.ReactElement[] = []
        theLocos.forEach((loco: ConsistLoco, i: number) => {
            out.push(
                <div key={`locoInTbl${i}`}>
                    {getLocoName(loco._id)}
                </div>
            )
        })
        return out
    }

    const makeConsists = (): React.ReactElement[] => {
        let out: React.ReactElement[] = []

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
                            onClick={() => setDeleteModal({ show: true, id: consist._id, entity: consist })}
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

    const deleteConsist = (id: string) => {
        window.electron.invoke('deleteConsist', id)
            .then((res: unknown) => {
                setConsists(res as Consist[])
                handleClose()
            })
            .catch((err: unknown) => console.error(err))
    }

    const makeDeleteModal = (): React.ReactElement | undefined => {
        if (deleteModal.show && deleteModal.entity) {
            return (
                <Modal
                    show={deleteModal.show}
                    onClose={handleClose}
                    title="Delete Consist"
                    footer={
                        <>
                            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                            <Button variant="danger" onClick={() => deleteModal.entity && deleteConsist(deleteModal.entity._id)}>Delete Consist</Button>
                        </>
                    }
                >
                    Are you sure you want to delete consist <b>{deleteModal.entity?.name}</b>?
                </Modal>
            )
        }
        return undefined
    }

    useEffect(() => {
        window.electron.invoke('getConsists')
            .then((res: unknown) => setConsists(res as Consist[]))
            .catch((err: unknown) => console.error(err))

        window.electron.invoke('getLocomotives')
            .then((res: unknown) => setLocos(res as Locomotive[]))
            .catch((err: unknown) => console.error(err))
    }, [])

    return (
        <div className='pageContainer'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Consists</b>
                <Button variant='secondary' size='sm' onClick={() => navigate('/consists/new')}>
                    <AddCircleTwoToneIcon style={{ fontSize: '18px', marginRight: '4px' }} />
                    Add Consist
                </Button>
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
