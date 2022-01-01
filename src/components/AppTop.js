import React, { useEffect, useState } from 'react'
import Toolbar from "./Toolbar";
import LocoIcon from "./LocoIcon";
import Layout from '../layouts/Layout';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Decoders from './decoders/Decoders';
import Consists from './consists/Consists';
import Locomotives from './locomotives/Locomotives';
import Switches from './switches/Switches';
import Accessories from './accessories/Accessories';
import Macros from './macros/Macros';
import CVedit from '../CVedit';
import AccessoryButtons from './accessories/AccessoryButtons';
import LocoControl from '../modals/LocoControl';
import Settings from './Settings';
import { Button } from 'react-bootstrap';
import ProgrammingTrack from './ProgrammingTrack';


export default function AppTop() {
    const navigate = useNavigate()
    const [state, setState] = useState({ selectedLoco: 0, activeTrack: 0, showAll: false, locos: [] })

    useEffect(() => {
        let tempLocos = state.locos
        for (var locoNum = 0; locoNum < state.locos.length; locoNum++) {
            var tempFunState = []
            for (var i = 0; i < 32; i++) { tempFunState[i] = false }
            tempLocos[locoNum].functionState = tempFunState
        }

        // Get Locos here
        window.electron.ipcRenderer.invoke('getLocomotives')
            .then(theLocos => {
                const makeLocos = (xLocos) => {
                    let locos = JSON.parse(JSON.stringify(xLocos))

                    for (let i = 0; i < locos.length; i++) {
                        locos[i].functionState = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
                    }
                    return locos
                }

                setState(old => ({ ...old, locos: makeLocos(theLocos) }))
            })
            .catch(err => console.log(err))

        let tempState = { ...state }
        tempState.locos = tempLocos
        setState(tempState)

        return () => {
        }
    }, [])

    const setTrack = (track) => {
        let tempState = { ...state }
        tempState.activeTrack = track
        setState(tempState)
    }

    const selectLoco = (locoIndex) => {
        //console.log('IN SELECT LOCO ' + locoIndex)
        let tempState = { ...state }
        tempState.selectedLoco = locoIndex
        setState(tempState)
    }

    const handleToggleHidden = () => {
        console.log('Toggle Hidden Locos')
        let tempState = { ...state }
        if (state.showAll) {
            tempState.showAll = false
            setState(tempState)
        } else {
            tempState.showAll = true
            setState(tempState)
        }
    }

    const handleSetAllStopped = () => {
        var tempState = { ...state }

        for (var i = 0; i < tempState.locos.length; i++) {
            tempState.locos[i].direction = 'stopped'
        }
        setState(tempState)
    }

    const makeLocoIcons = () => {
        let locoIcons = []
        //console.log('START')
        //console.log(locoIcons.length)
        //console.log(locoIcons)

        if (state.locos.length <= 0) return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}><b>No Locomotives</b></div>
                <div style={{ textAlign: 'center' }}><Button size='sm' onClick={() => navigate('/locomotives/new')}>Add Locomotive</Button></div>
            </div>
        )

        for (var i = 0; i < state.locos.length; i++) {
            //console.log('Look Here ' + i)

            var color = 'lightgrey'
            if (i === state.selectedLoco) {
                color = '#3498DB'
            }

            if (state.locos[i].hidden) {
                color = '#D98880'
            }

            var tempKey = "LocoIcon" + i

            if (!state.locos[i].hidden || state.showAll) {
                locoIcons.push(
                    <div key={tempKey} name="LocoSlot" style={{ display: 'inline-block' }}>
                        <LocoIcon
                            loco={state.locos[i]}
                            numberOfLocos={state.locos.length - 1}
                            index={i}
                            selected={selectLoco}
                            color={color}
                        />
                    </div>
                )
            }
        }

        let btnLbl

        if (state.showAll) {
            btnLbl = "Hide Locos"
        } else {
            btnLbl = "Show All Locos"
        }

        var isOneHidden = false
        for (var locoCnt = 0; locoCnt < state.locos.length; locoCnt++) {
            if (state.locos[locoCnt].hidden) {
                isOneHidden = true
                break
            }
        }

        if (isOneHidden) {
            locoIcons.push(
                <div key="Show/HideButton" name="showHideBtn" style={{ display: 'inline-block' }}>
                    <div style={{
                        backgroundColor: 'white',
                        height: '118px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        fontSize: '12px',
                        padding: '0px 10px',
                        cursor: 'context-menu',
                        borderRadius: '5px'
                    }}
                        onMouseDown={handleToggleHidden}
                    >
                        <div>
                            {btnLbl}
                        </div>
                    </div>
                </div>
            )
        }

        return locoIcons
    }

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div><Toolbar locos={state.locos} setAllStopped={handleSetAllStopped} /></div>
            <div style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', maxWidth: '100%', maxHeight: '100%', display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: '300px', height: '100%', overflow: 'hidden' }}><LocoControl selectedLoco={state.selectedLoco} /></div>
                    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', height: '100%' }}>
                        <Routes>
                            <Route path="/locomotives/*" element={<Locomotives />} />
                            <Route path="/decoders/*" element={<Decoders />} />
                            <Route path="/consists/*" element={<Consists />} />
                            <Route path="/switches/*" element={<Switches />} />
                            <Route path="/accessories/*" element={<Accessories />} />
                            <Route path="/macros/*" element={<Macros />} />
                            <Route path="/cv/*" element={<CVedit />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/programming" element={<ProgrammingTrack />} />
                            <Route path="*"
                                element={
                                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                backgroundColor: '#7B7D7D',
                                                maxWidth: '100%',
                                                width: '100%',
                                                height: '140px',
                                                minHeight: '140px',
                                                display: 'flex',
                                                overflow: 'hidden',
                                                overflowX: 'auto',
                                            }}
                                        >
                                            {makeLocoIcons()}
                                        </div>
                                        <div style={{
                                            height: '100%', width: '100%', maxWidth: '100%', display: 'flex',
                                            flexDirection: 'column', overflow: 'hidden', backgroundColor: 'rgb(123,125,125)'
                                        }}>
                                            <Layout activeTrack={state.activeTrack} setActiveTrack={setTrack} />
                                        </div>
                                        <div style={{ padding: '10px' }}><AccessoryButtons /></div>
                                    </div>
                                }
                            />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    )
}