import React, { useEffect, useState } from 'react'
import UsbIcon from '@mui/icons-material/Usb';
import UsbOffIcon from '@mui/icons-material/UsbOff';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function USBstatus() {
    const navigate = useNavigate()
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
                <OverlayTrigger
                    placement='right'
                    overlay={<Tooltip>USB device connected</Tooltip>}
                    delay={{ show: 250, hide: 0 }}
                >
                    <div style={{ ...usbStyle, color: 'green', backgroundColor: 'white' }}>
                        <UsbIcon style={{ fontSize: '31px' }} />
                    </div>
                </OverlayTrigger>
            )
        } else {
            return (
                <OverlayTrigger
                    placement='right'
                    overlay={<Tooltip>USB device disconnected</Tooltip>}
                    delay={{ show: 250, hide: 0 }}
                >
                    <div
                        className='usbError'
                        style={{ ...usbStyle, cursor:'pointer' }}
                        onClick={() => navigate('/settings')}
                    >
                        <UsbOffIcon style={{ fontSize: '31px' }} />
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
    borderRadius: '4px',
    transform: 'rotate(90deg)',
}