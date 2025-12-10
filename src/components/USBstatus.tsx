import React, { useEffect, useState } from 'react'
import UsbIcon from '@mui/icons-material/Usb';
import UsbOffIcon from '@mui/icons-material/UsbOff';
import { Tooltip, useTheme } from '../ui';
import { useNavigate } from 'react-router-dom';

export default function USBstatus() {
    const theme = useTheme()
    const navigate = useNavigate()
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        window.electron.invoke('getUsbConnection')
            .then((res: unknown) => setIsConnected(res as boolean))
            .catch((err: unknown) => console.error(err))

        window.electron.receive('usbConnection', (connection: unknown) => {
            console.log(connection)
            setIsConnected(connection as boolean)
        })

        return () => window.electron.removeListener('usbConnection')
    }, [])

    const makeUsbStatus = () => {
        if (isConnected) {
            return (
                <Tooltip text="USB device connected">
                    <div style={{
                        marginLeft: theme.spacing.md,
                        borderRadius: theme.borderRadius.sm,
                        transform: 'rotate(90deg)',
                        color: theme.colors.success,
                        backgroundColor: theme.colors.light
                    }}>
                        <UsbIcon style={{ fontSize: '31px' }} />
                    </div>
                </Tooltip>
            )
        } else {
            return (
                <Tooltip text="USB device disconnected">
                    <div
                        className='usbError'
                        style={{
                            marginLeft: theme.spacing.md,
                            borderRadius: theme.borderRadius.sm,
                            transform: 'rotate(90deg)',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/settings')}
                    >
                        <UsbOffIcon style={{ fontSize: '31px', color: '#000' }} />
                    </div>
                </Tooltip>
            )
        }
    }

    return (
        <div>
            {makeUsbStatus()}
        </div>
    )
}

