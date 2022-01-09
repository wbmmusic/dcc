import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { overlayDelay } from '../../settings'
import StopCircleTwoToneIcon from '@mui/icons-material/StopCircleTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import ArrowForwardIosTwoToneIcon from '@mui/icons-material/ArrowForwardIosTwoTone';
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import { useNavigate } from 'react-router-dom';
const join = window.electron.join


export default function LocoIcon(props) {
    const navigate = useNavigate()

    const getAddressBytes = () => {
        var address = props.loco.address
        console.log("Address = " + address)
        var lowByte = address & 0xff
        var highByte = (address >> 8) & 0xff
        var highBytex = highByte | 0xC0
        return [highBytex, lowByte]
    }

    const settings = () => {
        console.log('SETTINGS idx:' + props.index + ' ' + props.loco.name + ' ' + props.loco.number)
        navigate('/locomotives/edit/' + props.loco._id)
    }

    const selectThisLoco = () => props.selected(props.index)
    const moveLeft = () => console.log('Move LocoIcon Left')
    const moveRight = () => console.log('Move LocoIcon Right')

    const estop = () => {
        console.log('E-STOP')
        var addy = getAddressBytes()
        window.electron.send('send-serial', [0xA2, addy[0], addy[1], 5, 0])
    }

    const openThrottle = (id) => window.electron.send('newThrottle', id)

    let leftButton = (
        <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">Move left</Tooltip>}>
            <div style={iconDivStyle} onMouseDown={moveLeft}>
                <ArrowBackIosNewTwoToneIcon style={iconStyle} />
            </div>
        </OverlayTrigger>
    )

    let rightButton = (
        <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">Move right</Tooltip>}>
            <div style={iconDivStyle} onMouseDown={moveRight}>
                <ArrowForwardIosTwoToneIcon style={iconStyle} />
            </div>
        </OverlayTrigger>
    )

    if (props.index <= 0) leftButton = ''
    if (props.index >= props.numberOfLocos) rightButton = ''

    return (
        <div style={iconContainerStyle}>
            <div style={{ backgroundColor: props.color }}>
                <table style={{ width: '100%' }} cellSpacing={0}>
                    <tbody>
                        <tr>
                            <td style={topBarCell}>
                                <OverlayTrigger delay={overlayDelay} overlay={<Tooltip id="tooltip-disabled">Open Throttle Window</Tooltip>}>
                                    <div style={iconDivStyle} onMouseDown={() => openThrottle(props.loco._id)} >
                                        <OpenInNewTwoToneIcon style={iconStyle} />
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
            <div
                style={{ cursor: 'pointer', fontSize: '10px', textAlign: 'left' }}
                onMouseDown={selectThisLoco}
                onDoubleClick={() => openThrottle(props.loco._id)}
            >
                <div style={{ padding: '0px 3px', overflow: 'hidden', }}>{props.loco.name}</div>
                <div style={{ padding: '0px 3px', marginBottom: '3px', }}><b>{props.loco.number}</b></div>
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
                    <img alt="Locomotive" width='80%' src={join('loco://', props.loco.photo)} />
                </div>

                <div style={{ height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                    {props.loco.model}
                </div>
            </div>
        </div>
    )
}

const topBarCell = {
    width: '25%'
}
const iconStyle = {
    fontSize: '22px'
}
const iconDivStyle = {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center'
}
const iconContainerStyle = {
    backgroundColor: 'white',
    display: 'inline-block',
    height: '118px',
    margin: '0px 3px',
    textAlign: 'center',
    width: '104px',
    overflow: 'hidden',
    boxShadow: '1px 1px 4px',
    borderRadius: '2px'
}