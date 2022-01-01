import React, { Fragment, useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import ArrowForwardTwoToneIcon from '@mui/icons-material/ArrowForwardTwoTone';
import SwapHorizTwoToneIcon from '@mui/icons-material/SwapHorizTwoTone';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone';
import ArrowForwardIosTwoToneIcon from '@mui/icons-material/ArrowForwardIosTwoTone';
import Select from 'react-select';
import { selectStyle } from '../../styles';

export default function EditConsist() {
    const location = useLocation()
    const navigate = useNavigate()
    const [consist, setConsist] = useState({ name: '', address: '', locos: [] })
    const [locos, setLocos] = useState([])

    const isCreatable = () => {
        if (consist.name === '' || consist.address === '' || isNaN(consist.address)) return false
        else return true
    }

    const makeTitle = () => {
        if (location.pathname.includes('new')) return "Create"
        else if (location.pathname.includes('edit')) return "Edit"
        else return 'ERROR'
    }

    const makeButtons = () => {

        const makeBtn = () => {
            if (location.pathname.includes('new')) return <Button disabled={!isCreatable()} size="sm">Create Consist</Button>
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
        let tempConsistLocos = JSON.parse(JSON.stringify(consist.locos))
        const moveMe = tempConsistLocos.splice(idx, 1)[0]
        tempConsistLocos.splice(idx - 1, 0, moveMe)
        setConsist(old => ({ ...old, locos: tempConsistLocos }))
    }

    const moveBackward = (idx) => {
        let tempConsistLocos = JSON.parse(JSON.stringify(consist.locos))
        const moveMe = tempConsistLocos.splice(idx, 1)[0]
        tempConsistLocos.splice(idx + 1, 0, moveMe)
        setConsist(old => ({ ...old, locos: tempConsistLocos }))
    }

    const makeMove = (idx) => {
        let out = []

        if (idx === consist.locos.length - 1 && consist.locos.length > 1) {
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
        } else if (idx === 0 && consist.locos.length > 1) {
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
        } else if (consist.locos.length === 1) {
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
        const flip = (fwd) => {
            if (fwd) return { transform: 'scale(-1, 1)' }
            else return {}
        }

        consist.locos.forEach((theLoco, i) => {
            const loco = locos.find(lco => lco._id === theLoco._id)
            out.unshift(
                <div key={`loco${loco + i}`} style={{ display: 'inline-block', backgroundColor: theLoco.forward ? 'lightGrey' : 'khaki', margin: '2px', padding: '8px' }}>
                    <img style={{ width: '100%', ...flip(theLoco.forward) }} src="aimg://locoSideProfile.png" alt="side profile" />
                    <div style={{ display: 'flex' }}>
                        <div style={{ whiteSpace: 'nowrap' }}><b>{`${loco.name} ${loco.number}`}</b></div>
                        <div style={{ textAlign: 'right', width: '100%' }}>
                            <div
                                style={{ display: 'inline-block', cursor: 'pointer' }}
                                onClick={() => setConsist(old => {
                                    let tempOld = JSON.parse(JSON.stringify(old))
                                    tempOld.locos[i].forward = !old.locos[i].forward
                                    return tempOld
                                })}
                            >
                                <SwapHorizTwoToneIcon />
                            </div>
                            <div
                                style={{ display: 'inline-block', cursor: 'pointer', color: 'red', margin: '0px 8px' }}
                                onClick={() => setConsist(old => {
                                    let tempOld = JSON.parse(JSON.stringify(old))
                                    tempOld.locos.splice(i, 1)
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
                    <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid black', paddingTop: '6px' }}>
                        <img style={{ width: '150px' }} src={`loco://${loco.photo}`} alt="loco" />
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
                <div key={`direction${i}`} style={{ display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    Forward <ArrowForwardTwoToneIcon />
                </div>
            )
        }
        return out
    }

    const makeLocoOptions = () => {
        let out = []
        locos.forEach(loco => out.push({ label: `${loco.name} ${loco.number}`, value: loco._id }))
        return out
    }

    const handleLocoSelect = (selectedLocos) => {
        let tempLocos = [...consist.locos]

        // Remove new locos
        let removeThese = []

        tempLocos.forEach((currentLoco) => {
            let found = false
            for (let i = 0; i < selectedLocos.length; i++) {
                if (selectedLocos[i].value === currentLoco._id) {
                    found = true
                    break
                }
            }
            if (!found) removeThese.push(currentLoco._id)
        });
        removeThese.forEach(element => {
            let removeIdx = tempLocos.findIndex(loco => loco._id === element)
            if (removeIdx >= 0) tempLocos.splice(removeIdx, 1)
        })


        // add new loco
        selectedLocos.forEach(selectedLoco => {
            let consistLocoIDX = consist.locos.findIndex(loco => loco._id === selectedLoco.value)
            if (consistLocoIDX < 0) tempLocos.push({ _id: selectedLoco.value, forward: true })
        });
        setConsist(old => ({ ...old, locos: tempLocos }))
    }

    const makeLocoSelectValue = () => {
        let out = []

        consist.locos.slice().reverse().forEach(theLoco => {
            let loco = locos.find(lco => lco._id === theLoco._id)
            out.push({ label: `${loco.name} ${loco.number}`, value: loco._id })
        })

        return out
    }

    const handleAddressInput = (address) => {
        const newAddress = parseInt(address)
        if (newAddress > 127) return 127
        if (newAddress < 0) return 127
        return newAddress
    }

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getLocomotives')
            .then(res => setLocos(res))
            .catch(err => console.error(err))
    }, [])

    useEffect(() => console.log(consist), [consist])

    return (
        <div>
            <div><b>{makeTitle()} Consist</b></div>
            <hr />
            <div>
                <div style={{ display: 'inline-block' }}>
                    <Table size='sm'>
                        <tbody>
                            <tr>
                                <td style={labelStyle}>Name:</td>
                                <td>
                                    <input
                                        placeholder='Consist Name'
                                        type="text"
                                        value={consist.name}
                                        onChange={(e) => setConsist(old => ({ ...old, name: e.target.value }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Address:</td>
                                <td>
                                    <input
                                        type='number'
                                        min={0}
                                        max={127}
                                        placeholder='0-127'
                                        value={consist.address}
                                        onChange={e => setConsist(old => ({ ...old, address: handleAddressInput(e.target.value) }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Locos:</td>
                                <td>
                                    <Select
                                        options={makeLocoOptions()}
                                        styles={selectStyle}
                                        isMulti
                                        onChange={handleLocoSelect}
                                        value={makeLocoSelectValue()}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
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