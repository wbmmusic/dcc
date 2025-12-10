/**
 * Application Settings Component
 * 
 * Provides configuration interface for DCC system settings including USB interface
 * selection, serial port configuration, and backup/restore functionality.
 */

import React, { useEffect, useState } from 'react'
import { Settings as SettingsType, SerialPort } from '../types'
import { Button, useTheme } from '../ui'
import { Modal } from '../ui'
import Select from 'react-select'
import { selectStyle } from './../styles'

/**
 * Available DCC interface types
 * Currently supports NCE USB interface with potential for future expansion
 */
const ifaceOptions = [
    { label: 'NCE USB Interface', value: 'nceUsb' }
]

/**
 * Settings Configuration Component
 * 
 * Features:
 * - USB interface type selection (NCE PowerCab USB)
 * - Serial port detection and selection with real-time updates
 * - Configuration backup to ZIP file with images
 * - Configuration restore with data validation
 * - Automatic port scanning and validation
 * 
 * The component monitors serial port changes and updates the interface
 * automatically when devices are connected or disconnected.
 * 
 * @returns {React.JSX.Element} Settings configuration interface
 */
export default function Settings() {
    const theme = useTheme()
    const [settings, setSettings] = useState<SettingsType | null>(null)
    const [serialPorts, setSerialPorts] = useState<SerialPort[]>([])
    const [restoreModal, setRestoreModal] = useState(false)

    const makeIfaceValue = () => {
        if (settings !== null) {
            if (settings.usbInterface.type !== '') {
                const ifaceIDX = ifaceOptions.findIndex(iface => iface.value === settings.usbInterface.type)
                if (ifaceIDX >= 0) return ifaceOptions[ifaceIDX]
            }
        }
        return null
    }

    const handleIfaceSelect = (e) => {
        window.electron.invoke('setUSBiface', e.value)
            .then(res => setSettings(res))
            .catch(err => console.error(err))
    }

    const handlePortSelect = (e) => {
        window.electron.invoke('setUSBport', e.value)
            .then(res => setSettings(res))
            .catch(err => console.error(err))
    }

    const makePortOptions = () => {
        let out = []
        serialPorts.forEach(port => out.push({ label: `${port.path} | SN:${port.serialNumber}`, value: port.path }))
        return out
    }

    const makePortValue = () => {
        if (settings === null || serialPorts.length <= 0) return null
        if (settings.usbInterface.port === '') return null
        const portIDX = serialPorts.findIndex(prt => prt.path === settings.usbInterface.port)
        if (portIDX >= 0) {
            const port = serialPorts[portIDX]
            return { label: `${port.path} | SN:${port.serialNumber}`, value: port.path }
        } else return { label: `! ${settings.usbInterface.port} NOT FOUND !`, value: 'xxx' }
    }

    const makeRestoreModal = () => {
        if (restoreModal) {
            return (
                <Modal
                    show={restoreModal}
                    onHide={() => setRestoreModal(false)}
                    title="Restore Warning"
                    footer={
                        <>
                            <Button variant="secondary" size="sm" onClick={() => setRestoreModal(false)}>Close</Button>
                            <Button variant="danger" size="sm"
                                onClick={() => {
                                    window.electron.send('restoreConfig')
                                    setRestoreModal(false)
                                }}
                            >Proceed to Restore</Button>
                        </>
                    }
                >
                    <div>All current locomotives, decoders, consists, macros, switches, and images will be lost.</div>
                    <div><b>If you care about your current configuration you better back it up!!</b></div>
                </Modal>
            )
        }
    }

    useEffect(() => {
        window.electron.invoke('getSettings')
            .then(res => setSettings(res))
            .catch(err => console.error(err))

        window.electron.invoke('getSerialPorts')
            .then(res => setSerialPorts(res))
            .catch(err => console.error(err))

        window.electron.receive('serialPorts', (ports) => setSerialPorts(ports))

        return () => window.electron.removeListener('serialPorts')
    }, [])

    useEffect(() => console.log(settings), [settings])
    useEffect(() => console.log(serialPorts), [serialPorts])

    return (
        <div style={{ padding: theme.spacing.md }}>
            <div className='pageContainer'>
                <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>Settings</div>
                <hr style={{ borderColor: theme.colors.gray[600] }} />
                <div>
                    <div style={{ marginBottom: theme.spacing.sm, fontSize: theme.fontSize.md, fontWeight: 'bold' }}>USB Interface</div>
                    <div style={{ display: 'inline-block', backgroundColor: theme.colors.gray[800], whiteSpace: 'nowrap', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[600]}` }}>
                        <table cellPadding={theme.spacing.xs}>
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Interface: </td>
                                    <td style={{ width: '200px' }}>
                                        <Select
                                            styles={selectStyle}
                                            options={ifaceOptions}
                                            value={makeIfaceValue()}
                                            onChange={handleIfaceSelect}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ textAlign: 'right' }}>Serial Port: </td>
                                    <td>
                                        <Select
                                            styles={selectStyle}
                                            options={makePortOptions()}
                                            onChange={handlePortSelect}
                                            value={makePortValue()}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <hr style={{ borderColor: theme.colors.gray[600] }} />
                <div>
                    <div style={{ marginBottom: theme.spacing.sm, fontSize: theme.fontSize.md, fontWeight: 'bold' }}>Backup & Restore</div>
                    <Button
                        variant='warning'
                        size="sm"
                        onClick={() => window.electron.send('backupConfig')}
                    >Backup to file</Button>
                    <Button
                        variant='danger'
                        style={{ marginLeft: theme.spacing.sm }}
                        size="sm"
                        onClick={() => setRestoreModal(true)}
                    >Restore from file</Button>
                    {makeRestoreModal()}
                </div>
            </div>
        </div>
    )
}
