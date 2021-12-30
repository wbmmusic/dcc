import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Select from 'react-select'
import { selectStyle } from './../styles'

const ifaceOptions = [
    { label: 'NCE USB Interface', value: 'nceUsb' }
]

export default function Settings() {
    const [settings, setSettings] = useState(null)
    const [serialPorts, setSerialPorts] = useState([])

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
        window.electron.ipcRenderer.invoke('setUSBiface', e.value)
            .then(res => setSettings(res))
            .catch(err => console.error(err))
    }

    const handlePortSelect = (e) => {
        window.electron.ipcRenderer.invoke('setUSBport', e.value)
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
        const portIDX = serialPorts.findIndex(prt => prt.path === settings.usbInterface.port)
        if (portIDX >= 0) {
            const port = serialPorts[portIDX]
            return { label: `${port.path} | SN:${port.serialNumber}`, value: port.path }
        }
        return null
    }

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getSettings')
            .then(res => setSettings(res))
            .catch(err => console.error(err))

        window.electron.ipcRenderer.invoke('getSerialPorts')
            .then(res => setSerialPorts(res))
            .catch(err => console.error(err))

        window.electron.receive('serialPorts', (ports) => setSerialPorts(ports))
        
        return () => window.electron.removeListener('serialPorts')
    }, [])

    useEffect(() => console.log(settings), [settings])
    useEffect(() => console.log(serialPorts), [serialPorts])

    return (
        <div style={{ padding: '10px' }}>
            <div className='pageContainer'>
                <div><b>Settings</b></div>
                <hr />
                <div>
                    <div><b>USB</b></div>
                    <div style={{ display: 'inline-block', backgroundColor: 'lightGrey', whiteSpace: 'nowrap', borderRadius: '3px' }}>
                        <table cellPadding="3">
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
                <hr />
                <div>
                    <Button
                        variant='warning'
                        style={{ marginLeft: '8px' }}
                        size="sm"
                        onClick={() => window.electron.send('backupConfig')}
                    >Backup</Button>
                    <Button
                        variant='danger'
                        style={{ marginLeft: '8px' }}
                        size="sm"
                        onClick={() => window.electron.send('restoreConfig')}
                    >Restore</Button>
                </div>
            </div>
        </div>
    )
}
