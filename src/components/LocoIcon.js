import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { overlayDelay } from '../settings'
import { Arrow, ArrowLeft, ArrowRight, Gear, Stop } from './icons'
const path = require('path')

const { ipcRenderer } = window.require('electron')

export default function LocoIcon(props) {

    const getAddressBytes = () => {
        var address = props.loco.address

        console.log("Address = " + address)

        var lowByte = address & 0xff
        var highByte = (address >> 8) & 0xff
        var highBytex = highByte | 0xC0

        let output = [highBytex, lowByte]

        return output
    }

    const settings = () => {
        console.log('SETTINGS idx:' + props.index + ' ' + props.loco.name + ' ' + props.loco.number)
        props.openSettings(props.index)
    }

    const selectThisLoco = () => {
        console.log('SELECT idx:' + props.index + ' ' + props.loco.name + ' ' + props.loco.number)
        props.selected(props.index)
    }

    const moveLeft = () => {
        console.log('Move LocoIcon Left')
    }

    const moveRight = () => {
        console.log('Move LocoIcon Right')
    }

    const estop = () => {
        console.log('E-STOP')
        var addy = getAddressBytes()
        ipcRenderer.send('send-serial', [0xA2, addy[0], addy[1], 5, 0])
    }

    let leftButton = (
        <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">Move left</Tooltip>}>
            <div style={{ cursor: 'pointer', verticalAlign: 'middle' }}
                onMouseDown={moveLeft}
            >
                <ArrowLeft />
            </div>
        </OverlayTrigger>
    )

    let rightButton = (
        <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">Move right</Tooltip>}>
            <div style={{ cursor: 'pointer', verticalAlign: 'middle' }}
                onMouseDown={moveRight}
            >
                <ArrowRight />
            </div>
        </OverlayTrigger>
    )

    if (props.index <= 0) {
        leftButton = ''
    }

    if (props.index >= props.numberOfLocos) {
        rightButton = ''
    }

    return (
        <div
            style={{
                backgroundColor: 'white',
                display: 'inline-block',
                height: '118px',
                margin: '0px 3px',
                textAlign: 'center',
                width: '104px',
                overflow: 'hidden',
            }}
            onMouseDown={selectThisLoco}
        >
            <div style={{ fontSize: '14px', backgroundColor: props.color }}>
                <table style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td style={topBarCell}>
                                <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">E Stop</Tooltip>}>
                                    <div style={{ cursor: 'pointer', verticalAlign: 'middle' }} onMouseDown={estop}>
                                        <Stop />
                                    </div>
                                </OverlayTrigger>
                            </td>
                            <td style={topBarCell}>{leftButton}</td>
                            <td style={topBarCell}>{rightButton}</td>
                            <td style={topBarCell}>
                                <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">Settings</Tooltip>}>
                                    <div style={{ cursor: 'pointer' }} onMouseDown={settings}>
                                        <Gear />
                                    </div>
                                </OverlayTrigger>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style={{ cursor: 'pointer', fontSize: '10px', textAlign: 'left' }}>
                <div style={{ padding: '0px 3px', overflow: 'hidden', }}>
                    {props.loco.name}
                </div>
                <div style={{ padding: '0px 3px', marginBottom: '3px', }}>
                    <b>{props.loco.number}</b>
                </div>

                <div
                    style={{
                        //border: '1px solid black',
                        height: '43px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                >
                    <img alt="Locomotive" width='80%' src={path.join('C:', 'ProgramData', 'WBM Tek', 'dcc', 'locos', 'images', props.loco.photo)} />
                </div>

                <div style={{ height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                    {props.loco.model}
                </div>

            </div>

        </div>
    )
}

const topBarCell = {
    width: '25%',
    //border: '1px solid black'
}