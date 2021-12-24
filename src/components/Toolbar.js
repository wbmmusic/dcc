import React, { useEffect } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

export default function Toolbar(props) {
    const navigate = useNavigate()
    const estop = () => {
        console.log('E Stop All')
        for (var i = 0; i < props.locos.length; i++) {
            var addressBytes = getAddressBytes(props.locos[i].address)
            window.electron.send('send-serial', [0xA2, addressBytes[0], addressBytes[1], 5, 0])
        }

        props.setAllStopped()
    }

    const getAddressBytes = (tempAddress) => {
        var address = tempAddress

        console.log("Address = " + address)

        var lowByte = address & 0xff
        var highByte = (address >> 8) & 0xff
        var highBytex = highByte | 0xC0

        let output = [highBytex, lowByte]

        return output
    }

    useEffect(() => {
        window.electron.receive('eStopAll', () => estop())

        return () => {
            window.electron.removeListener('eStopAll')
        }
    }, [])

    return (
        <div style={barStyle}>
            <div
                style={{
                    backgroundColor: 'red',
                    display: 'inline-block',
                    padding: '5px 15px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '10px',
                    whiteSpace: 'nowrap'
                }}
                onMouseDown={() => estop()}
            >
                <b>E-STOP ALL</b>
            </div>

            <div style={{ textAlign: 'right', width: '100%', display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'lightGrey', whiteSpace: 'nowrap' }}>
                    <table cellPadding="4">
                        <tbody>
                            <tr>
                                <td>Serial Port: </td>
                                <td>
                                    <select>
                                        <option>COM16</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <Button size="sm" onClick={() => window.electron.send('newThrottle')} >Window</Button>
                <div style={{ display: 'inline-block' }}>
                    <Dropdown style={{ marginLeft: '8px' }}>
                        <Dropdown.Toggle size="sm" variant="primary" id="dropdown-basic">
                            Menu
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => navigate('/')} >Home</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/locomotives')} >Locomotives</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/decoders')} >Decoders</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/consists')} >Consists</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/switches')} >Switches</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/accessories')} >Accessories</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/macros')} >Macros</Dropdown.Item>
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