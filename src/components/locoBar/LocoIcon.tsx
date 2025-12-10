import React from 'react'
import { Tooltip, useTheme } from '../../ui'
import { overlayDelay } from '../../settings'
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import ArrowForwardIosTwoToneIcon from '@mui/icons-material/ArrowForwardIosTwoTone';
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import { useNavigate } from 'react-router-dom';


import { LocoIconProps, Locomotive } from '../../types';

export default function LocoIcon(props: LocoIconProps) {
    const theme = useTheme()
    const navigate = useNavigate()



    const settings = () => {
        console.log('SETTINGS idx:' + props.idx + ' ' + props.loco.name + ' ' + props.loco.number)
        navigate('/system/locomotives/edit/' + props.loco._id)
    }

    const selectThisLoco = () => props.setSelectedLoco(props.loco._id)
    const moveLeft = () => console.log('Move LocoIcon Left')
    const moveRight = () => console.log('Move LocoIcon Right')



    const openThrottle = (id: string) => window.electron.send('newThrottle', id)

    let leftButton = (
        <Tooltip text="Move left">
            <div style={iconDivStyle} onMouseDown={moveLeft} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <ArrowBackIosNewTwoToneIcon style={{...iconStyle, color: theme.colors.gray[400]}} />
            </div>
        </Tooltip>
    )

    let rightButton = (
        <Tooltip text="Move right">
            <div style={iconDivStyle} onMouseDown={moveRight} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <ArrowForwardIosTwoToneIcon style={{...iconStyle, color: theme.colors.gray[400]}} />
            </div>
        </Tooltip>
    )

    if (props.idx <= 0) leftButton = <span></span>
    if (props.idx >= (props.numberOfLocos || 0) - 1) rightButton = <span></span>



    return (
        <div style={{
            backgroundColor: props.selectedLoco === props.loco._id ? theme.colors.selected : theme.colors.gray[800],
            display: 'inline-block',
            height: '118px',
            margin: `0 ${theme.spacing.xs}`,
            textAlign: 'center',
            width: '104px',
            overflow: 'hidden',
            boxShadow: props.selectedLoco === props.loco._id ? `0 4px 12px ${theme.colors.safetyStripe}80` : '0 2px 8px rgba(0,0,0,0.3)',
            borderRadius: theme.borderRadius.md,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            border: props.selectedLoco === props.loco._id ? `2px solid ${theme.colors.safetyStripe}` : '2px solid transparent',
            color: theme.colors.light
        }}
        onMouseEnter={(e) => {
            if (props.selectedLoco !== props.loco._id) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
            }
        }}
        onMouseLeave={(e) => {
            if (props.selectedLoco !== props.loco._id) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
            }
        }}>
            <div style={{ backgroundColor: props.color, overflow: 'hidden' }}>
                <table style={{ width: '100%' }} cellSpacing={0}>
                    <tbody>
                        <tr>
                            <td style={topBarCell}>
                                <Tooltip text="Open Throttle Window">
                                    <div style={iconDivStyle} onMouseDown={() => openThrottle(props.loco._id)} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                        <OpenInNewTwoToneIcon style={{...iconStyle, color: theme.colors.gray[400]}} />
                                    </div>
                                </Tooltip>
                            </td>
                            <td style={topBarCell}>{leftButton}</td>
                            <td style={topBarCell}>{rightButton}</td>
                            <td style={topBarCell}>
                                <Tooltip text="Settings">
                                    <div style={iconDivStyle} onMouseDown={settings} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                        <SettingsTwoToneIcon style={{...iconStyle, color: theme.colors.gray[400]}} />
                                    </div>
                                </Tooltip>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div
                style={{ cursor: 'pointer', fontSize: theme.fontSize.xs }}
                onMouseDown={selectThisLoco}
                onDoubleClick={() => openThrottle(props.loco._id)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: `0 ${theme.spacing.xs}`, marginBottom: theme.spacing.xs }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{props.loco.name}</div>
                    <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold', marginLeft: theme.spacing.xs, color: theme.colors.warning }}>{props.loco.number}</div>
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
                    <img 
                        alt="Locomotive" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        src={`loco://${props.loco.photo || 'default.jpg'}`}

                    />
                </div>

                <div style={{ height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                    {props.loco.model}
                </div>
            </div>
        </div>
    )
}

const topBarCell: React.CSSProperties = { width: '25%', textAlign: 'center', verticalAlign: 'middle', padding: '2px 0' }
const iconStyle = { fontSize: '20px' }
const iconDivStyle = { cursor: 'pointer', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', transition: 'transform 0.2s ease' }