import React, { useEffect } from 'react'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const { ipcRenderer } = window.require('electron')


export default function LocoControl(props) {
    useEffect(() => {
        ipcRenderer.on('eStopSelected', (event) => {
            estop()
        })
        return () => {
            ipcRenderer.removeAllListeners('eStopSelected')
        }
    }, [])

    const funTog = (e) => {
        console.log('IN FUN TOGGLE')
        console.log(parseInt(e.target.id))

        if (!props.loco.functionState[parseInt(e.target.id)]) {
            console.log('Calling setFunction with On ' + parseInt(e.target.id))
            setFunction(parseInt(e.target.id), 'functionOn')
        } else {
            console.log('Calling setFunction with Off ' + parseInt(e.target.id))
            setFunction(parseInt(e.target.id), 'functionOff')
        }

    }

    const speedChange = (theValue) => {
        //console.log(theValue)
        props.speedChange(theValue)


        var addy = getAddressBytes()
        //ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], funOp, funDataX])

        if (props.loco.direction !== 'stopped') {
            if (props.loco.direction === 'forward') {
                ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 4, theValue])
            } else if (props.loco.direction === 'reverse') {
                ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 3, theValue])
            }
        }


    }

    const getAddressBytes = () => {
        var address = props.loco.address

        console.log("Address = " + address)

        var lowByte = address & 0xff
        var highByte = (address >> 8) & 0xff
        var highBytex = highByte | 0xC0

        let output = [highBytex, lowByte]

        return output
    }

    const stop = () => {
        console.log('STOP COMMAND - speed = ' + props.loco.speed)

        var addy = getAddressBytes()

        if (props.loco.direction === 'forward') {
            ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 4, 0])
        } else if (props.loco.direction === 'reverse') {
            ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 3, 0])
        }

        if (props.loco.direction !== 'stopped') {
            props.changeDirection('stopped')
        }
    }

    const forward = () => {
        console.log('FORWARD COMMAND - speed = ' + props.loco.speed)
        if (props.loco.direction !== 'forward') {
            props.changeDirection('forward')
        }

        var addy = getAddressBytes()
        ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 4, props.loco.speed])
    }

    const reverse = () => {
        console.log('REVERSE COMMAND - speed = ' + props.loco.speed)
        if (props.loco.direction !== 'reverse') {
            props.changeDirection('reverse')
        }

        var addy = getAddressBytes()
        ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], 3, props.loco.speed])
    }

    const estop = () => {
        console.log('E-STOP')
        var addy = getAddressBytes()
        ipcRenderer.send('send-serial', [0xA2, addy[0], addy[1], 5, 0])
        props.changeDirection('stopped')
    }

    const setFunction = (funNum, button) => {
        console.log(funNum)

        let funOp
        let funDataX = 0

        let tempData = props.loco.functionState

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
                    if (bit === 0 && tempData[bit]) {
                        funDataX = funDataX | 16
                    } else if (bit === 1 && tempData[bit]) {
                        funDataX = funDataX | 1
                    } else if (bit === 2 && tempData[bit]) {
                        funDataX = funDataX | 2
                    } else if (bit === 3 && tempData[bit]) {
                        funDataX = funDataX | 4
                    } else if (bit === 4 && tempData[bit]) {
                        funDataX = funDataX | 8
                    }
                }

            } else if (button === 'functionOff') {
                console.log('Function off 0-4')
                for (bit = 0; bit <= 4; bit++) {
                    if (bit === 0 && !tempData[bit]) {
                        funDataX = funDataX & 0xEF
                    } else if (bit === 1 && !tempData[bit]) {
                        funDataX = funDataX & 0xFE
                    } else if (bit === 2 && !tempData[bit]) {
                        funDataX = funDataX & 0xFD
                    } else if (bit === 3 && !tempData[bit]) {
                        funDataX = funDataX & 0xFB
                    } else if (bit === 4 && !tempData[bit]) {
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
                    if (bit1 === 5 && props.loco.functionState[bit1]) {
                        funDataX = funDataX | 1
                    } else if (bit1 === 6 && props.loco.functionState[bit1]) {
                        funDataX = funDataX | 2
                    } else if (bit1 === 7 && props.loco.functionState[bit1]) {
                        funDataX = funDataX | 4
                    } else if (bit1 === 8 && props.loco.functionState[bit1]) {
                        funDataX = funDataX | 8
                    }
                }


            } else if (button === 'functionOff') {
                console.log('Function off 5-8')

                for (var bit1 = 5; bit1 <= 8; bit1++) {
                    if (bit1 === 5 && !props.loco.functionState[bit1]) {
                        funDataX = funDataX & 0xFE
                    } else if (bit1 === 6 && !props.loco.functionState[bit1]) {
                        funDataX = funDataX & 0xFD
                    } else if (bit1 === 7 && !props.loco.functionState[bit1]) {
                        funDataX = funDataX & 0xFB
                    } else if (bit1 === 8 && !props.loco.functionState[bit1]) {
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
                    if (bit2 === 9 && props.loco.functionState[bit2]) {
                        funDataX = funDataX | 1
                    } else if (bit2 === 10 && props.loco.functionState[bit2]) {
                        funDataX = funDataX | 2
                    } else if (bit2 === 11 && props.loco.functionState[bit2]) {
                        funDataX = funDataX | 4
                    } else if (bit2 === 12 && props.loco.functionState[bit2]) {
                        funDataX = funDataX | 8
                    }
                }

            } else if (button === 'functionOff') {
                console.log('Function off 9-12')
                for (var bit2 = 9; bit2 <= 12; bit2++) {
                    if (bit2 === 9 && !props.loco.functionState[bit2]) {
                        funDataX = funDataX & 0xFE
                    } else if (bit2 === 10 && !props.loco.functionState[bit2]) {
                        funDataX = funDataX & 0xFD
                    } else if (bit2 === 11 && !props.loco.functionState[bit2]) {
                        funDataX = funDataX & 0xFB
                    } else if (bit2 === 12 && !props.loco.functionState[bit2]) {
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
                    if (bit3 === 13 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 1
                    } else if (bit3 === 14 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 2
                    } else if (bit3 === 15 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 4
                    } else if (bit3 === 16 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 8
                    } else if (bit3 === 17 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 16
                    } else if (bit3 === 18 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 32
                    } else if (bit3 === 19 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 64
                    } else if (bit3 === 20 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 128
                    }
                }

            } else if (button === 'functionOff') {
                console.log('Function off 13-20')

                for (var bit3 = 13; bit3 <= 20; bit3++) {
                    if (bit3 === 13 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xFE
                    } else if (bit3 === 14 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xFD
                    } else if (bit3 === 15 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xFB
                    } else if (bit3 === 16 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xF7
                    } else if (bit3 === 17 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xEF
                    } else if (bit3 === 18 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xDF
                    } else if (bit3 === 19 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xBF
                    } else if (bit3 === 20 && !props.loco.functionState[bit3]) {
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
                    if (bit3 === 21 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 1
                    } else if (bit3 === 22 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 2
                    } else if (bit3 === 23 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 4
                    } else if (bit3 === 24 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 8
                    } else if (bit3 === 25 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 16
                    } else if (bit3 === 26 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 32
                    } else if (bit3 === 27 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 64
                    } else if (bit3 === 28 && props.loco.functionState[bit3]) {
                        funDataX = funDataX | 128
                    }
                }

            } else if (button === 'functionOff') {
                console.log('Function off 21-28')
                for (var bit3 = 21; bit3 <= 28; bit3++) {
                    if (bit3 === 21 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xFE
                    } else if (bit3 === 22 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xFD
                    } else if (bit3 === 23 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xFB
                    } else if (bit3 === 24 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xF7
                    } else if (bit3 === 25 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xEF
                    } else if (bit3 === 26 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xDF
                    } else if (bit3 === 27 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0xBF
                    } else if (bit3 === 28 && !props.loco.functionState[bit3]) {
                        funDataX = funDataX & 0x7F
                    }
                }

            }


        }

        var addy = getAddressBytes()
        ipcRenderer.send('send-serial', [0xa2, addy[0], addy[1], funOp, funDataX])
        props.setFunction(funNum, tempData[funNum])
    }


    let functionButtons = []

    let forwardColor = 'white'
    let reverseColor = 'white'
    let stopColor = 'white'

    if (props.loco.direction === 'forward') {
        forwardColor = 'lightGreen'
    } else if (props.loco.direction === 'reverse') {
        reverseColor = 'lightGreen'
    } else if (props.loco.direction === 'stopped') {
        stopColor = '#D98880'
    }


    for (var i = 0; i < 32; i++) {
        if (props.loco.decoder.functions[i].info[2]) {

            let color = 'white'
            if (props.loco.functionState[i]) {
                color = 'lightGreen'
            }

            var tempKey = 'funBtn' + i

            functionButtons.push(
                <div
                    key={tempKey}
                    style={{
                        display: 'inline-block',
                        border: '1px solid black',
                        padding: '3px',
                        margin: '2px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        backgroundColor: color
                    }}
                    onMouseDown={funTog}
                    id={i}
                >
                    {props.loco.decoder.functions[i].info[1]}
                </div>
            )
        }
    }

    return (
        <div>
            <table
                style={{ border: '1px solid black', width: '100%', height: 'calc(100vh - 50px)' }}>
                <tbody>
                    <tr>
                        <td style={{ height: '100%', border: '1px solid black', padding: '12px 4px', backgroundColor: 'grey' }}>
                            <Slider min={0} max={126} vertical={true} value={props.loco.speed} onChange={speedChange} />
                        </td>
                        <td style={{ border: '1px solid black', textAlign: 'top' }}>

                            <div style={{ backgroundColor: 'lightgrey', height: '100%' }}>
                                <div style={{ backgroundColor: 'white', cursor: 'context-menu', paddingLeft: '3px' }}>
                                    <b style={{ fontSize: '20px' }} > {props.loco.name}</b>
                                </div>
                                <div style={{ backgroundColor: 'lightGrey', cursor: 'context-menu', paddingLeft: '3px' }}>
                                    <b style={{ fontSize: '20px' }} > {props.loco.number}</b>
                                </div>
                                <div style={{ backgroundColor: 'white', textAlign: 'center', cursor: 'context-menu', border: '4px solid black' }}>
                                    <b style={{ fontSize: '50px' }}>{props.loco.speed}</b>
                                </div>
                                <hr />
                                <div
                                    style={{ textAlign: 'center', padding: '5px', margin: '0px 5px', backgroundColor: 'red', borderRadius: '5px', cursor: 'pointer' }}
                                    onMouseDown={estop}
                                ><b>E-STOP</b></div>
                                <hr />
                                <div style={{ margin: '0px 5px' }}>
                                    <table style={{ width: '100%' }}>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <div
                                                        style={{ ...transportButtons, backgroundColor: forwardColor }}
                                                        onMouseDown={forward}
                                                    >Forward</div>
                                                </td>
                                                <td>
                                                    <div
                                                        style={{ ...transportButtons, backgroundColor: reverseColor }}
                                                        onMouseDown={reverse}
                                                    >Reverse</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan='2'>
                                                    <div
                                                        style={{ ...transportButtons, backgroundColor: stopColor }}
                                                        onMouseDown={stop}
                                                    >STOP</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <hr />
                                <div style={{ paddingLeft: '5px', textAlign: 'left' }}>
                                    <b>Functions</b>
                                </div>

                                <div style={{ overflow: 'auto' }}>
                                    {functionButtons}
                                </div>

                            </div>

                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

const btn = {
    border: '1px solid black',
    padding: '5px',
    borderRadius: '5px',
    textAlign: 'center',
    cursor: 'context-menu',
    backgroundColor: 'white'
}

const transportButtons = {
    border: '1px solid black',
    padding: '5px',
    borderRadius: '5px',
    textAlign: 'center',
    cursor: 'pointer',
}