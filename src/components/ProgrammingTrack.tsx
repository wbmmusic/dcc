import { Button, Table, Modal, Spinner, useTheme } from '../ui'
import React, { useEffect, useState } from 'react'

export default function ProgrammingTrack() {
    const theme = useTheme()
    const [programmingTrackStatus, setProgrammingTrackStatus] = useState(false)
    const defaultStatusModal = { show: false, action: '' }
    const [statusModal, setStatusModal] = useState(defaultStatusModal)

    const clearStatusModal = () => setStatusModal(defaultStatusModal)

    const inputStyle = {
        width: '80px',
        backgroundColor: theme.colors.gray[800],
        color: theme.colors.light,
        border: `1px solid ${theme.colors.gray[600]}`,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.xs
    }

    const makeProgrammingButton = () => {
        if (programmingTrackStatus) {
            return <Button
                size='sm'
                variant='success'
                onClick={() => {
                    setStatusModal({ show: true, action: 'Disabling Programming Track' })
                    window.electron.invoke('setProgrammingTrack', false)
                        .then((res: unknown) => {
                            setProgrammingTrackStatus(res as boolean)
                            clearStatusModal()
                        })
                        .catch((err: unknown) => console.error(err))
                }}
            >Disable Programming Track</Button>
        } else {
            return <Button
                size='sm'
                variant='danger'
                onClick={() => {
                    setStatusModal({ show: true, action: 'Enabling Programming Track' })
                    window.electron.invoke('setProgrammingTrack', true)
                        .then((res: unknown) => {
                            setProgrammingTrackStatus(res as boolean)
                            clearStatusModal()
                        })
                        .catch((err: unknown) => console.error(err))
                }}
            >Enable Programming Track</Button>
        }

    }

    const makeStatusModal = (): React.ReactElement | undefined => {
        if (statusModal.show) {
            return (
                <Modal
                    show={statusModal.show}
                    onClose={clearStatusModal}
                    title={statusModal.action}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing.lg }}>
                        <Spinner size='lg' />
                    </div>
                </Modal>
            )
        }
        return undefined
    }

    useEffect(() => {
        window.electron.invoke('getProgrammingTrackStatus')
            .then((res: unknown) => setProgrammingTrackStatus(res as boolean))
            .catch((err: unknown) => console.error(err))

        return () => {
            window.electron.invoke('setProgrammingTrack', false)
                .then((res: unknown) => console.log("On exit Programming track is", res))
                .catch((err: unknown) => console.error(err))
        }
    }, [])

    return (
        <div style={{ padding: theme.spacing.md }}>
            <div className="pageContainer">
                <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>Programming Track</div>
                <div style={{ marginTop: theme.spacing.md }}>
                    {makeProgrammingButton()}
                </div>
                <hr style={{ borderColor: theme.colors.gray[600] }} />
                <div>
                    <div style={{ padding: theme.spacing.md, backgroundColor: theme.colors.background.medium, borderRadius: theme.borderRadius.md }}>
                        <div style={{ fontSize: theme.fontSize.md, fontWeight: 'bold' }}>CVs</div>
                        <hr style={{ borderColor: theme.colors.gray[600] }} />
                        <div>
                            <div>
                                <div style={{ display: 'inline-block' }}>
                                    <Table borderless>
                                        <tbody>
                                            <tr>
                                                <td>Read CV</td>
                                                <td>
                                                    <input style={inputStyle} type='number' max={1000} placeholder='CV #' />
                                                </td>
                                                <td>
                                                    <Button
                                                        size='sm'
                                                        onClick={() => {
                                                            window.electron.invoke('readCvPrg', 63)
                                                                .then((res: unknown) => console.log("HERE 63=", res))
                                                                .catch((err: unknown) => console.error(err))
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
                                                        <input style={inputStyle} type='number' max={1000} placeholder='CV #' />
                                                    </td>
                                                    <td>
                                                        <input style={inputStyle} type='number' max={255} placeholder='CV Val' />
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
                    <hr style={{ borderColor: theme.colors.gray[600] }} />
                    <div style={{ padding: theme.spacing.md, backgroundColor: theme.colors.background.medium, borderRadius: theme.borderRadius.md }}>
                        <div style={{ fontSize: theme.fontSize.md, fontWeight: 'bold' }}>Registers</div>
                        <hr style={{ borderColor: theme.colors.gray[600] }} />
                        <div>
                            <div>
                                <div style={{ display: 'inline-block' }}>
                                    <Table borderless>
                                        <tbody>
                                            <tr>
                                                <td>Read Register</td>
                                                <td>
                                                    <input style={inputStyle} type='number' max={1000} placeholder='CV #' />
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
                                                    <input style={inputStyle} type='number' max={1000} placeholder='CV #' />
                                                </td>
                                                <td>
                                                    <input style={inputStyle} type='number' max={255} placeholder='CV Value' />
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

