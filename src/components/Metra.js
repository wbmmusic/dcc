import React, { useEffect, useState } from 'react'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const { ipcRenderer } = window.require('electron')

export default function Metra() {
    const [state, setState] = useState({
        forward: true,
        stopped: true,
        speed: 0,
        name: 'Enter A Name',
        address: 3810,
        functionState: [],
        functionNumber: 0
    })

    useEffect(() => {
        var tempFunState = []

        for (var i = 0; i < 32; i++) {
            tempFunState[i] = false
        }

        let tempState = { ...state }
        tempState.functionState = tempFunState
        setState(tempState)
    }, [])

    const stop = () => {
        console.log('STOP COMMAND - speed = ' + state.speed)


        var addy = getAddressBytes()

        if (state.forward) {
            ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 4, 0])
        } else {
            ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 3, 0])
        }

        let tempState = { ...state }
        tempState.stopped = true
        setState(tempState)
    }

    const forward = () => {
        console.log('FORWARD COMMAND - speed = ' + state.speed)

        var addy = getAddressBytes()
        ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 4, state.speed])

        let tempState = { ...state }
        tempState.forward = true
        tempState.stopped = false
        setState(tempState)
    }

    const reverse = () => {
        console.log('REVERSE COMMAND - speed = ' + state.speed)

        var addy = getAddressBytes()
        ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 3, state.speed])

        let tempState = { ...state }
        tempState.forward = false
        tempState.stopped = false
        setState(tempState)
    }

    const speedChange = theValue => {
        console.log(theValue)

        var addy = getAddressBytes()
        //ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], funOp, funDataX])

        if (!state.stopped) {
            if (state.forward) {
                ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 4, theValue])
            } else {
                ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 3, theValue])
            }
        }

        let tempState = { ...state }
        tempState.speed = theValue
        setState(tempState)

    }

    const setFunction = (e) => {
        var funNum = state.functionNumber
        console.log(funNum)
        console.log(e.target.name)

        var button = e.target.name

        let funOp
        let funDataX = 0

        let tempData = state.functionState

        if (button === 'functionOn') {
            tempData[funNum] = true
        } else if (button === 'functionOff') {
            tempData[funNum] = false
        }

        if (funNum >= 0 && funNum <= 4) {
            funOp = 0x07
            funDataX = 0

            if (button === 'functionOn') {
                console.log('Function on 0-4')
                for (var bit = 0; bit <= 4; bit++) {
                    if (bit === 0 && state.functionState[bit]) {
                        funDataX = funDataX | 16
                    } else if (bit === 1 && state.functionState[bit]) {
                        funDataX = funDataX | 1
                    } else if (bit === 2 && state.functionState[bit]) {
                        funDataX = funDataX | 2
                    } else if (bit === 3 && state.functionState[bit]) {
                        funDataX = funDataX | 4
                    } else if (bit === 4 && state.functionState[bit]) {
                        funDataX = funDataX | 8
                    }
                }

            } else if (button === 'functionOff') {
                console.log('Function off 0-4')
                for (var bit = 0; bit <= 4; bit++) {
                    if (bit === 0 && !state.functionState[bit]) {
                        funDataX = funDataX & 0xEF
                    } else if (bit === 1 && !state.functionState[bit]) {
                        funDataX = funDataX & 0xFE
                    } else if (bit === 2 && !state.functionState[bit]) {
                        funDataX = funDataX & 0xFD
                    } else if (bit === 3 && !state.functionState[bit]) {
                        funDataX = funDataX & 0xFB
                    } else if (bit === 4 && !state.functionState[bit]) {
                        funDataX = funDataX & 0xF7
                    }
                }
            }

        } else if (funNum >= 5 && funNum <= 8) {
            funOp = 0x08
            funDataX = 0

            if (button === 'functionOn') {
                console.log('Function on 5-8')

                for (var bit1 = 5; bit1 <= 8; bit1++) {
                    if (bit1 === 5 && state.functionState[bit1]) {
                        funDataX = funDataX | 1
                    } else if (bit1 === 6 && state.functionState[bit1]) {
                        funDataX = funDataX | 2
                    } else if (bit1 === 7 && state.functionState[bit1]) {
                        funDataX = funDataX | 4
                    } else if (bit1 === 8 && state.functionState[bit1]) {
                        funDataX = funDataX | 8
                    }
                }


            } else if (button === 'functionOff') {
                console.log('Function off 5-8')

                for (var bit1 = 5; bit1 <= 8; bit1++) {
                    if (bit1 === 5 && !state.functionState[bit1]) {
                        funDataX = funDataX & 0xFE
                    } else if (bit1 === 6 && !state.functionState[bit1]) {
                        funDataX = funDataX & 0xFD
                    } else if (bit1 === 7 && !state.functionState[bit1]) {
                        funDataX = funDataX & 0xFB
                    } else if (bit1 === 8 && !state.functionState[bit1]) {
                        funDataX = funDataX & 0xF7
                    }
                }

            }



        } else if (funNum >= 9 && funNum <= 12) {
            funOp = 0x09
            funDataX = 0

            if (button === 'functionOn') {
                console.log('Function on 9-12')
                for (var bit2 = 9; bit2 <= 12; bit2++) {
                    if (bit2 === 9 && state.functionState[bit2]) {
                        funDataX = funDataX | 1
                    } else if (bit2 === 10 && state.functionState[bit2]) {
                        funDataX = funDataX | 2
                    } else if (bit2 === 11 && state.functionState[bit2]) {
                        funDataX = funDataX | 4
                    } else if (bit2 === 12 && state.functionState[bit2]) {
                        funDataX = funDataX | 8
                    }
                }

            } else if (button === 'functionOff') {
                console.log('Function off 9-12')
                for (var bit2 = 9; bit2 <= 12; bit2++) {
                    if (bit2 === 9 && !state.functionState[bit2]) {
                        funDataX = funDataX & 0xFE
                    } else if (bit2 === 10 && !state.functionState[bit2]) {
                        funDataX = funDataX & 0xFD
                    } else if (bit2 === 11 && !state.functionState[bit2]) {
                        funDataX = funDataX & 0xFB
                    } else if (bit2 === 12 && !state.functionState[bit2]) {
                        funDataX = funDataX & 0xF7
                    }
                }
            }

        } else if (funNum >= 13 && funNum <= 20) {
            funOp = 0x15
            funDataX = 0

            if (button === 'functionOn') {
                console.log('Function on 13-20')
                for (var bit3 = 13; bit3 <= 20; bit3++) {
                    if (bit3 === 13 && state.functionState[bit3]) {
                        funDataX = funDataX | 1
                    } else if (bit3 === 14 && state.functionState[bit3]) {
                        funDataX = funDataX | 2
                    } else if (bit3 === 15 && state.functionState[bit3]) {
                        funDataX = funDataX | 4
                    } else if (bit3 === 16 && state.functionState[bit3]) {
                        funDataX = funDataX | 8
                    } else if (bit3 === 17 && state.functionState[bit3]) {
                        funDataX = funDataX | 16
                    } else if (bit3 === 18 && state.functionState[bit3]) {
                        funDataX = funDataX | 32
                    } else if (bit3 === 19 && state.functionState[bit3]) {
                        funDataX = funDataX | 64
                    } else if (bit3 === 20 && state.functionState[bit3]) {
                        funDataX = funDataX | 128
                    }
                }

            } else if (button === 'functionOff') {
                console.log('Function off 13-20')

                for (var bit3 = 13; bit3 <= 20; bit3++) {
                    if (bit3 === 13 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xFE
                    } else if (bit3 === 14 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xFD
                    } else if (bit3 === 15 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xFB
                    } else if (bit3 === 16 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xF7
                    } else if (bit3 === 17 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xEF
                    } else if (bit3 === 18 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xDF
                    } else if (bit3 === 19 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xBF
                    } else if (bit3 === 20 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0x7F
                    }
                }

            }


        } else if (funNum >= 21 && funNum <= 28) {
            funOp = 0x16
            funDataX = 0

            if (button === 'functionOn') {
                console.log('Function on 21-28')
                for (var bit3 = 21; bit3 <= 28; bit3++) {
                    if (bit3 === 21 && state.functionState[bit3]) {
                        funDataX = funDataX | 1
                    } else if (bit3 === 22 && state.functionState[bit3]) {
                        funDataX = funDataX | 2
                    } else if (bit3 === 23 && state.functionState[bit3]) {
                        funDataX = funDataX | 4
                    } else if (bit3 === 24 && state.functionState[bit3]) {
                        funDataX = funDataX | 8
                    } else if (bit3 === 25 && state.functionState[bit3]) {
                        funDataX = funDataX | 16
                    } else if (bit3 === 26 && state.functionState[bit3]) {
                        funDataX = funDataX | 32
                    } else if (bit3 === 27 && state.functionState[bit3]) {
                        funDataX = funDataX | 64
                    } else if (bit3 === 28 && state.functionState[bit3]) {
                        funDataX = funDataX | 128
                    }
                }

            } else if (button === 'functionOff') {
                console.log('Function off 21-28')
                for (var bit3 = 21; bit3 <= 28; bit3++) {
                    if (bit3 === 21 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xFE
                    } else if (bit3 === 22 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xFD
                    } else if (bit3 === 23 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xFB
                    } else if (bit3 === 24 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xF7
                    } else if (bit3 === 25 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xEF
                    } else if (bit3 === 26 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xDF
                    } else if (bit3 === 27 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0xBF
                    } else if (bit3 === 28 && !state.functionState[bit3]) {
                        funDataX = funDataX & 0x7F
                    }
                }

            }


        }

        var addy = getAddressBytes()
        ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], funOp, funDataX])

        let tempState = { ...state }
        tempState.funData = tempData
        setState(tempState)
    }

    const handleFunctionChange = (e) => {
        let tempState = { ...state }
        tempState.functionNumber = e.target.value
        setState(tempState)
    }

    const estop = () => {
        console.log('E Stop in Metra.js')
        var addy = getAddressBytes()
        ipcRenderer.send('send-serial', [0xA2, addy[0], addy[1], 5, 0])
    }

    const handleNameChange = (e) => {
        //console.log(e.target.value)
        let tempState = { ...state }
        tempState.name = e.target.value
        setState(tempState)
    }

    const handleAddressChange = (e) => {
        //console.log(e.target.value)
        let tempState = { ...state }
        tempState.address = e.target.value
        setState(tempState)
    }

    const getAddressBytes = () => {
        var address = state.address

        console.log("Address = " + address)

        var lowByte = address & 0xff
        var highByte = (address >> 8) & 0xff
        var highBytex = highByte | 0xC0

        let output = [highBytex, lowByte]

        return output
    }


    const stopIndicator = {
        backgroundColor: state.stopped ? 'red' : 'grey',
        margin: '0px 10px',
        height: '10px',
        borderRadius: '5px',
    }

    const forwardIndicator = {
        backgroundColor: state.forward && !state.stopped ? 'lightGreen' : 'grey',
        margin: '0px 10px',
        height: '10px',
        borderRadius: '5px',
    }

    const reverseIndicator = {
        backgroundColor: !state.forward && !state.stopped ? 'lightGreen' : 'grey',
        margin: '0px 10px',
        height: '10px',
        borderRadius: '5px',
    }


    return (
        <div style={container}>
            <div>




                <table>
                    <tbody>
                        <tr>
                            <td>Name:</td>
                            <td>
                                <input
                                    value={state.name}
                                    onChange={handleNameChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Addr:</td>
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    max="9999"
                                    value={state.address}
                                    onChange={handleAddressChange}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <hr />
            <br />
                Speed
            <div style={{
                padding: '8px'
            }}>
                <Slider
                    min={0}
                    max={127}
                    onChange={speedChange}
                />
            </div>

            <div
                style={{
                    fontSize: '30px',
                    marginBottom: '20px'
                }}
            ><b>{state.speed}</b></div>

            <hr style={{ width: '80%' }} />

            <table>
                <tbody>
                    <tr>
                        <td>
                            <button
                                style={btns}
                                onMouseDown={forward}
                            >
                                Forward
                                </button>
                            <div style={forwardIndicator}></div>
                        </td>
                        <td>
                            <button
                                style={btns}
                                onMouseDown={reverse}
                            >
                                Reverse
                                </button>
                            <div style={reverseIndicator}></div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <button
                                style={btns}
                                onMouseDown={stop}
                            >
                                STOP
                                 </button>
                            <div style={stopIndicator}></div>
                        </td>
                    </tr>
                </tbody>
                <input
                    type='number'
                    min='0'
                    max='31'
                    value={state.functionNumber}
                    onChange={handleFunctionChange}
                >

                </input>
                <button
                    style={{
                        padding: '5px'
                    }}
                    onMouseDown={setFunction}
                    name='functionOn'
                >ON</button>

                <button
                    style={{
                        padding: '5px'
                    }}
                    onMouseDown={setFunction}
                    name='functionOff'
                >OFF</button>

            </table>
        </div>
    )
}

const btns = {
    padding: '10px',
    marginBottom: '5px',
    marginTop: '5px',
    width: '100%',
    fontSize: '30px',

}

const container = {
    backgroundColor: 'darkGrey',
    display: 'inline-block',
    padding: '20px',
    margin: '10px',
    borderRadius: '15px',
    border: '5px solid lightgrey'
}