import React from 'react'

const { ipcRenderer } = window.require('electron')

export default function Smail() {

    const open = () => {
        console.log('Switch Open')
        ipcRenderer.send('send-serial', [0xAD, 0x00, 3, 3, 0])
    }

    const close = () => {
        console.log('Switch close')
        ipcRenderer.send('send-serial', [0xAD, 0x00, 3, 4, 0])
    }

    return (
        <div style={switchStyle}>
            <b>SWITCH</b>
            <table style={tblStyle}>
                <tbody>
                    <tr>
                        <td
                            style={cellStyle}
                            onMouseDown={() => open()}
                        >
                            OPEN 
                        </td>
                        <td
                            style={cellStyle}
                            onMouseDown={() => close()}
                        >
                            CLOSE
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

const switchStyle = {
    backgroundColor: 'white',
    display: 'inline-block',
    padding: '5px'
}

const cellStyle = {
    border: '1px solid black',
    textAlign: 'center',
    borderRadius: '5px',
    cursor: 'context-menu'
}

const tblStyle = {
    width: '160px',
    padding: '5px'
}