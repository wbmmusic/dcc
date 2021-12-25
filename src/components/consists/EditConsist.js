import React, { Fragment, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import ArrowForwardTwoToneIcon from '@mui/icons-material/ArrowForwardTwoTone';
import SwapHorizTwoToneIcon from '@mui/icons-material/SwapHorizTwoTone';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone';
import ArrowForwardIosTwoToneIcon from '@mui/icons-material/ArrowForwardIosTwoTone';
import Select from 'react-select';

export default function EditConsist() {
    const location = useLocation()
    const navigate = useNavigate()
    const [consists, setConsists] = useState([
        { name: 'Loco X', forward: true },
        { name: 'Loco Y', forward: true },
        { name: 'Loco Z', forward: false },
    ])

    const makeButtons = () => {

        const makeBtn = () => {
            if (location.pathname.includes('new')) return <Button size="sm">Create Consist</Button>
            else if (location.pathname.includes('edit')) return <Button size="sm">Update Consist</Button>
            else return 'ERROR'
        }

        return (
            <div style={{ textAlign: 'right' }}>
                <Button size="sm" onClick={() => navigate('/consists')}>Cancel</Button>
                <div style={{ display: 'inline-block', width: '8px' }} />
                {makeBtn()}
            </div>
        )
    }

    const moveForward = (idx) => {
        let tempConsists = JSON.parse(JSON.stringify(consists))
        const moveMe = tempConsists.splice(idx, 1)[0]
        tempConsists.splice(idx - 1, 0, moveMe)
        setConsists(tempConsists)
    }

    const moveBackward = (idx) => {
        let tempConsists = JSON.parse(JSON.stringify(consists))
        const moveMe = tempConsists.splice(idx, 1)[0]
        tempConsists.splice(idx + 1, 0, moveMe)
        setConsists(tempConsists)
    }

    const makeMove = (idx) => {
        let out = []

        if (idx === consists.length - 1 && consists.length > 1) {
            out = (
                <Fragment>
                    <div style={moveDivStyle}>
                        Move
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={() => moveForward(idx)}
                        >
                            <ArrowForwardIosTwoToneIcon />
                        </div>
                    </div>
                </Fragment>
            )
        } else if (idx === 0 && consists.length > 1) {
            out = (
                <Fragment>
                    <div style={moveDivStyle}>
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={() => moveBackward(idx)}
                        >
                            <ArrowBackIosNewTwoToneIcon />
                        </div>
                        Move
                    </div>
                </Fragment>
            )
        } else if (consists.length === 1) {
            console.log("YEAHHHH")
            out = <div />
        } else {
            out = (
                <Fragment>
                    <div style={moveDivStyle}>
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={() => moveBackward(idx)}
                        >
                            <ArrowBackIosNewTwoToneIcon />
                        </div>
                        Move
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                            onClick={() => moveForward(idx)}>
                            <ArrowForwardIosTwoToneIcon />
                        </div>
                    </div>
                </Fragment>
            )
        }
        return out
    }

    const makeTrain = () => {
        let out = []
        const flip = (loco) => {
            if (loco.forward) return { transform: 'scale(-1, 1)' }
            else return {}
        }

        consists.forEach((loco, i) => {
            out.unshift(
                <div key={`loco${loco + i}`} style={{ display: 'inline-block', backgroundColor: loco.forward ? 'lightGrey' : 'khaki', margin: '2px' }}>
                    <img style={{ width: '100%', ...flip(loco) }} src="loco://locoSideProfile.png" alt="side profile" />
                    <div style={{ display: 'flex' }}>
                        <div style={{ whiteSpace: 'nowrap' }}><b>{loco.name}</b></div>
                        <div style={{ textAlign: 'right', width: '100%' }}>
                            <div
                                style={{ display: 'inline-block', cursor: 'pointer' }}
                                onClick={() => setConsists(old => {
                                    let tempOld = JSON.parse(JSON.stringify(old))
                                    tempOld[i].forward = !loco.forward
                                    return tempOld
                                })}
                            >
                                <SwapHorizTwoToneIcon />
                            </div>
                            <div
                                style={{ display: 'inline-block', cursor: 'pointer', color: 'red', margin: '0px 8px' }}
                                onClick={() => setConsists(old => {
                                    let tempOld = [...old]
                                    old[i] = !old[i]
                                    return tempOld
                                })}
                            >
                                <ClearTwoToneIcon />
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '4px'
                        }}
                    >
                        {makeMove(i)}
                    </div>
                </div>
            )
        })


        return (
            <Fragment>
                {out}
            </Fragment>
        )
    }

    const makeDirection = () => {
        let out = []
        for (let i = 0; i < 4; i++) {
            out.push(
                <div style={{ display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    Forward <ArrowForwardTwoToneIcon />
                </div>
            )
        }
        return out
    }

    return (
        <div>
            <div><b>Edit Consist</b></div>
            <hr />
            <div>
                <div style={{ display: 'inline-block' }}>
                    <Table size='sm'>
                        <tbody>
                            <tr>
                                <td style={labelStyle}>Name:</td>
                                <td>
                                    <input type="text" />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Address:</td>
                                <td>
                                    <input type="text" />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Locos:</td>
                                <td>
                                    <Select styles={selectStyle} isMulti />
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
            <hr />
            <div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        backgroundColor: 'silver'
                    }}
                >
                    {makeDirection()}
                </div>
                <div style={{ display: 'flex', width: '100%' }}>{makeTrain()}</div>
            </div>
            <hr />
            {makeButtons()}
        </div>
    )
}

const labelStyle = { textAlign: 'right' }
const moveDivStyle = { borderTop: '1px solid black', padding: '10px' }
const selectStyle = {
    control: base => ({
        ...base,
        fontSize: '12px',
        minHeight: '15px'
    }),
    menu: base => ({
        ...base,
        fontSize: '12px'
    }),
    dropdownIndicator: base => ({
        ...base,
        padding: '0px 8px'
    }),
    valueContainer: base => ({
        ...base,
        padding: '0px 8px'
    })
}