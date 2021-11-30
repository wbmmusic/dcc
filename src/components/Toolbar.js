import React, { useEffect } from 'react'

const { ipcRenderer } = window.require('electron')

export default function Toolbar(props) {
    const estop = () => {
        console.log('E Stop All')
        for (var i = 0; i < props.locos.length; i++) {
            var addressBytes = getAddressBytes(props.locos[i].address)
            ipcRenderer.send('send-serial', [0xA2, addressBytes[0], addressBytes[1], 5, 0])
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
        ipcRenderer.on('eStopAll', (event) => estop())

        return () => {
            ipcRenderer.removeAllListeners('eStopAll')
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
                    marginRight: '10px'
                }}
                onMouseDown={() => estop()}
            >
                <b>E-STOP ALL</b>
            </div>
            <div style={{ display: 'inline-block', backgroundColor: 'lightGrey' }}>
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
        </div >
    )
}

const barStyle = {
    backgroundColor: 'darkGrey',
    padding: '3px',
    display: 'flex'
}