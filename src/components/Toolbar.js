import React, { useEffect, useState } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import USBstatus from './USBstatus';

export default function Toolbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [windowsAreOpen, setWindowsAreOpen] = useState(false)

    const makeHomeBtn = () => {
        if (location.pathname !== '/') return <Button style={{ marginLeft: '8px' }} size="sm" onClick={() => navigate('/')} >Home</Button>
    }

    const makeCloseThrottlesBtn = () => {
        if (windowsAreOpen) {
            return (
                <Button
                    variant='warning'
                    style={{ marginLeft: '8px' }}
                    size="sm"
                    onClick={() => window.electron.send('closeThrottles')}
                >
                    Close Throttles
                </Button>
            )
        }
    }

    useEffect(() => {
        window.electron.receive('throttlesClosed', () => setWindowsAreOpen(false))
        window.electron.receive('throttlesOpen', () => setWindowsAreOpen(true))

        return () => {
            window.electron.removeListener('throttlesClosed')
            window.electron.removeListener('throttlesOpen')
        }
    }, [])

    return (
        <div style={barStyle}>

            <Button style={{ width: '150px' }} variant='danger' size="sm">E-STOP ALL</Button>
            <USBstatus />
            <div style={{ textAlign: 'right', width: '100%', display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
                {makeHomeBtn()}
                {makeCloseThrottlesBtn()}
                <div style={{ display: 'inline-block' }}>
                    <Dropdown style={{ marginLeft: '8px' }}>
                        <Dropdown.Toggle size="sm" variant="primary" id="dropdown-basic">
                            Menu
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => navigate('/')} >Home</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/settings')} >Settings</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/locomotives')} >Locomotives</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/decoders')} >Decoders</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/consists')} >Consists</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/switches')} >Switches</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/accessories')} >Accessories</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/macros')} >Macros</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/cv')} >CV programmer</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/programming')} >Programming Track</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}

const barStyle = {
    backgroundColor: 'darkGrey',
    padding: '3px',
    display: 'flex',
    alignItems: 'center'
}