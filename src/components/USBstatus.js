import React, { useEffect, useState } from 'react'
import UsbIcon from '@mui/icons-material/Usb';
import UsbOffIcon from '@mui/icons-material/UsbOff';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function USBstatus() {
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getUsbConnection')
            .then(res => setIsConnected(res))
            .catch(err => console.error(err))

        window.electron.receive('usbConnection', (connection) => {
            console.log(connection)
            setIsConnected(connection)
        })

        return () => window.electron.removeListener('usbConnection')
    }, [])

    const makeUsbStatus = () => {
        if (isConnected) {
            return (
                <div style={{ ...usbStyle, color: 'green' }}>
                    <UsbIcon />
                </div>
            )
        } else {
            return (
                <OverlayTrigger
                    placement='right'
                    overlay={<Tooltip>No USB device connected</Tooltip>}
                    delay={{ show: 250, hide: 0 }}
                >
                    <div style={{ ...usbStyle, color: 'red' }}>
                        <UsbOffIcon />
                    </div>
                </OverlayTrigger>
            )
        }
    }

    return (
        <div>
            {makeUsbStatus()}
        </div>
    )
}

const usbStyle = {
    marginLeft: '8px',
    backgroundColor: 'white',
    padding: '2px',
    borderRadius: '4px',
    transform: 'rotate(270deg)'
}