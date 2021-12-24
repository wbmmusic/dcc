import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { overlayDelay } from '../settings'
import StopCircleTwoToneIcon from '@mui/icons-material/StopCircleTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import ArrowForwardIosTwoToneIcon from '@mui/icons-material/ArrowForwardIosTwoTone';
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone';
const join = window.electron.join


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
        window.electron.send('send-serial', [0xA2, addy[0], addy[1], 5, 0])
    }

    let leftButton = (
        <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">Move left</Tooltip>}>
            <div
                style={iconDivStyle}
                onMouseDown={moveLeft}
            >
                <ArrowBackIosNewTwoToneIcon style={iconStyle} />
            </div>
        </OverlayTrigger>
    )

    let rightButton = (
        <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">Move right</Tooltip>}>
            <div
                style={iconDivStyle}
                onMouseDown={moveRight}
            >
                <ArrowForwardIosTwoToneIcon style={iconStyle} />
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
            <div style={{ backgroundColor: props.color }}>
                <table style={{ width: '100%' }} cellSpacing={0}>
                    <tbody>
                        <tr>
                            <td style={topBarCell}>
                                <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">E Stop</Tooltip>}>
                                    <div style={{ ...iconDivStyle, color: 'red' }} onMouseDown={estop}>
                                        <StopCircleTwoToneIcon style={iconStyle} />
                                    </div>
                                </OverlayTrigger>
                            </td>
                            <td style={topBarCell}>{leftButton}</td>
                            <td style={topBarCell}>{rightButton}</td>
                            <td style={topBarCell}>
                                <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">Settings</Tooltip>}>
                                    <div style={iconDivStyle} onMouseDown={settings}>
                                        <SettingsTwoToneIcon style={iconStyle} />
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
                    <img alt="Locomotive" width='80%' src={join('atom://', props.loco.photo)} />
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

const iconStyle = { fontSize: '22px' }
const iconDivStyle = { cursor: 'pointer', display: 'flex', justifyContent: 'center' }