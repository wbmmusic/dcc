import React, { Fragment, useEffect, useState } from 'react'
import { Button, Table, useTheme } from '../../ui'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ArrowForwardTwoToneIcon from '@mui/icons-material/ArrowForwardTwoTone';
import SwapHorizTwoToneIcon from '@mui/icons-material/SwapHorizTwoTone';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone';
import ArrowForwardIosTwoToneIcon from '@mui/icons-material/ArrowForwardIosTwoTone';
import Select from 'react-select';
import { selectStyle } from '../../styles';

export default function EditConsist() {
    const theme = useTheme()
    const location = useLocation()
    const navigate = useNavigate()
    const consistID = useParams().consistID

    const [consist, setConsist] = useState({ name: '', address: '', locos: [] })
    const [ogConsist, setOgConsist] = useState()
    const [locos, setLocos] = useState([])

    const isCreatable = () => {
        if (consist.name === '' || consist.address === '' || isNaN(consist.address)) return false
        else return true
    }

    const isUpdatable = () => {
        if (!isCreatable()) return false
        if (JSON.stringify(ogConsist) === JSON.stringify(consist)) return false
        return true
    }

    const makeTitle = () => {
        if (location.pathname.includes('new')) return "Create"
        else if (location.pathname.includes('edit')) return "Edit"
        else return 'ERROR'
    }

    const handleCreateConsist = () => {
        window.electron.invoke('createConsist', {
            _id: window.electron.uuid(),
            enabled: false,
            ...consist
        })
            .then(res => navigate('/consists'))
            .catch(err => console.log(err))
    }

    const handleUpdateConsist = () => {
        window.electron.invoke('updateConsist', consist)
            .then(res => {
                setConsist(res)
                setOgConsist(res)
            })
            .catch(err => console.log(err))
    }

    const makeButtons = () => {

        const makeBtn = () => {
            if (location.pathname.includes('new')) return <Button disabled={!isCreatable()} size="sm" onClick={handleCreateConsist}>Create Consist</Button>
            else if (location.pathname.includes('edit')) return <Button disabled={!isUpdatable()} size="sm" onClick={handleUpdateConsist}>Update Consist</Button>
            else return 'ERROR'
        }

        return (
            <div style={{ textAlign: 'right' }}>
                <Button size="sm" variant="secondary" onClick={() => navigate('/consists')}>Cancel</Button>
                <div style={{ display: 'inline-block', width: theme.spacing.sm }} />
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
                <div key={`loco${loco + i}`} style={{ 
                    display: 'inline-block', 
                    backgroundColor: theme.colors.gray[800], 
                    margin: theme.spacing.xs, 
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `2px solid ${theLoco.forward ? theme.colors.success : theme.colors.warning}`
                }}>
                    <img style={{ width: '100%', ...flip(theLoco.forward) }} src="aimg://locoSideProfile.png" alt="side profile" />
                    <div style={{ display: 'flex' }}>
                        <div style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>{`${loco.name} ${loco.number}`}</div>
                        <div style={{ textAlign: 'right', width: '100%' }}>
                            <div
                                style={{ display: 'inline-block', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                                onClick={() => setConsist(old => {
                                    let tempOld = JSON.parse(JSON.stringify(old))
                                    tempOld.locos[i].forward = !old.locos[i].forward
                                    return tempOld
                                })}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <SwapHorizTwoToneIcon />
                            </div>
                            <div
                                style={{ display: 'inline-block', cursor: 'pointer', color: theme.colors.danger, margin: `0 ${theme.spacing.sm}`, transition: 'transform 0.2s ease' }}
                                onClick={() => setConsist(old => {
                                    let tempOld = JSON.parse(JSON.stringify(old))
                                    tempOld.locos.splice(i, 1)
                                    return tempOld
                                })}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
                    <div style={{ display: 'flex', justifyContent: 'center', borderTop: `1px solid ${theme.colors.gray[600]}`, paddingTop: theme.spacing.xs }}>
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
        window.electron.invoke('getLocomotives')
            .then(res => setLocos(res))
            .catch(err => console.error(err))

        if (location.pathname.includes('/edit')) {
            console.log(consistID)
            window.electron.invoke('getConsistByID', consistID)
                .then(res => {
                    setConsist(res)
                    setOgConsist(res)
                })
                .catch(err => console.error(err))
        }
    }, [])

    //useEffect(() => console.log(consist), [consist])

    return (
        <div className='pageContainer'>
            <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>{makeTitle()} Consist</div>
            <hr style={{ borderColor: theme.colors.gray[600] }} />
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
                                        style={{
                                            backgroundColor: theme.colors.gray[800],
                                            color: theme.colors.light,
                                            border: `1px solid ${theme.colors.gray[600]}`,
                                            borderRadius: theme.borderRadius.sm,
                                            padding: theme.spacing.xs
                                        }}
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
                                        style={{
                                            backgroundColor: theme.colors.gray[800],
                                            color: theme.colors.light,
                                            border: `1px solid ${theme.colors.gray[600]}`,
                                            borderRadius: theme.borderRadius.sm,
                                            padding: theme.spacing.xs
                                        }}
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
                        backgroundColor: theme.colors.gray[700],
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.md
                    }}
                >
                    {makeDirection()}
                </div>
                <div style={{ display: 'flex', width: '100%' }}>{makeTrain()}</div>
            </div>
            <hr style={{ borderColor: theme.colors.gray[600] }} />
            {makeButtons()}
        </div>
    )
}

const labelStyle = { textAlign: 'right' }
const moveDivStyle = { padding: '10px' }