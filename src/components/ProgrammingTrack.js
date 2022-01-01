import { Button, Modal, Spinner, Table } from 'react-bootstrap'
import React, { useEffect, useState } from 'react'

export default function ProgrammingTrack() {
    const [programmingTrackStatus, setProgrammingTrackStatus] = useState(false)
    const defaultStatusModal = { show: false, action: '' }
    const [statusModal, setStatusModal] = useState(defaultStatusModal)

    const clearStatusModal = () => setStatusModal(defaultStatusModal)

    const makeProgrammingButton = () => {
        if (programmingTrackStatus) {
            return <Button
                size='sm'
                variant='success'
                onClick={() => {
                    setStatusModal({ show: true, action: 'Disabling Programming Track' })
                    window.electron.ipcRenderer.invoke('setProgrammingTrack', false)
                        .then(res => {
                            setProgrammingTrackStatus(res)
                            clearStatusModal()
                        })
                        .catch(err => console.error(err))
                }}
            >Disable Programming Track</Button>
        } else {
            return <Button
                size='sm'
                variant='danger'
                onClick={() => {
                    setStatusModal({ show: true, action: 'Enabling Programming Track' })
                    window.electron.ipcRenderer.invoke('setProgrammingTrack', true)
                        .then(res => {
                            setProgrammingTrackStatus(res)
                            clearStatusModal()
                        })
                        .catch(err => console.error(err))
                }}
            >Enable Programming Track</Button>
        }

    }

    const makeStatusModal = () => {
        if (statusModal.show) {
            return (
                <Modal
                    show={statusModal.show}
                    onHide={clearStatusModal}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header>
                        <Modal.Title>{statusModal.action}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Spinner size='lg' animation='border' />
                    </Modal.Body>
                </Modal>
            )
        }
    }

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getProgrammingTrackStatus')
            .then(res => setProgrammingTrackStatus(res))
            .catch(err => console.error(err))

        return () => {
            window.electron.ipcRenderer.invoke('setProgrammingTrack', false)
                .then(res => console.log("On exit Programming track is", res))
                .catch(err => console.error(err))
        }
    }, [])

    return (
        <div style={{ padding: '10px' }}>
            <div className="pageContainer">
                <div><b>Programming Track</b></div>
                <div style={{ marginTop: '10px' }}>
                    {makeProgrammingButton()}
                </div>
                <hr />
                <div>
                    <div style={sectionStyle}>
                        <div><b>CVs</b></div>
                        <hr />
                        <div>
                            <div>
                                <div style={{ display: 'inline-block' }}>
                                    <Table borderless>
                                        <tbody>
                                            <tr>
                                                <td>Read CV</td>
                                                <td>
                                                    <input style={{ width: '80px' }} type='number' max={1000} placeholder='CV #' />
                                                </td>
                                                <td>
                                                    <Button
                                                        size='sm'
                                                        onClick={() => {
                                                            window.electron.ipcRenderer.invoke('readCvPrg', 63)
                                                                .then(res => console.log("HERE 63=", res))
                                                                .catch(err => console.error(err))
                                                        }}
                                                    >Read CV</Button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div style={{ display: 'inline-block' }}>
                                        <Table borderless>
                                            <tbody>
                                                <tr>
                                                    <td>Program CV</td>
                                                    <td>
                                                        <input style={{ width: '80px' }} type='number' max={1000} placeholder='CV #' />
                                                    </td>
                                                    <td>
                                                        <input style={{ width: '80px' }} type='number' max={255} placeholder='CV Val' />
                                                    </td>
                                                    <td>
                                                        <Button variant='warning' size='sm'>Program CV</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div style={sectionStyle}>
                        <div><b>Registers</b></div>
                        <hr />
                        <div>
                            <div>
                                <div style={{ display: 'inline-block' }}>
                                    <Table borderless>
                                        <tbody>
                                            <tr>
                                                <td>Read Register</td>
                                                <td>
                                                    <input style={{ width: '80px' }} type='number' max={1000} placeholder='CV #' />
                                                </td>
                                                <td>
                                                    <Button size='sm'>Read Register</Button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'inline-block' }}>
                                    <Table borderless>
                                        <tbody>
                                            <tr>
                                                <td>Program Register</td>
                                                <td>
                                                    <input style={{ width: '80px' }} type='number' max={1000} placeholder='CV #' />
                                                </td>
                                                <td>
                                                    <input style={{ width: '80px' }} type='number' max={255} placeholder='CV Value' />
                                                </td>
                                                <td>
                                                    <Button variant='warning' size='sm'>Program Register</Button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {makeStatusModal()}
        </div>
    )
}

const sectionStyle = { padding: '10px', backgroundColor: 'silver', borderRadius: '5px' }