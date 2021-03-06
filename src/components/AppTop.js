import React, { useEffect, useState } from 'react'
import Toolbar from "./Toolbar";
import LocoControl from "./LocoControl";
import LocoIcon from "./LocoIcon";
import LocoSettings from "./LocoSettings";
import { dcdr1 } from "./Decoders";
import Layout from '../layouts/Layout';
import { Route, Switch, useHistory } from 'react-router-dom';

const { ipcRenderer } = window.require('electron');


export default function AppTop() {
    let history = useHistory()
    const [state, setState] = useState({
        selectedLoco: 0,
        activeTrack: 0,
        showAll: false,
        locos: []
    })

    const defaultLoco = {
        hidden: false,
        name: 'Default Name',
        number: 9999,
        address: 9999,
        model: 'Enter Model',
        photo: 'default.jpg',
        decoder: dcdr1(),
        speed: 0,
        functionState: [],
        direction: 'stopped'
    }

    useEffect(() => {

        let tempLocos = state.locos
        for (var locoNum = 0; locoNum < state.locos.length; locoNum++) {

            var tempFunState = []
            for (var i = 0; i < 32; i++) {
                tempFunState[i] = false
            }

            tempLocos[locoNum].functionState = tempFunState
        }

        ipcRenderer.on('locos', (e, theLocos) => {
            console.log('Got Locos')
            console.log(theLocos)
            let tempState = { ...state }
            tempState.locos = theLocos
            tempState.locos.forEach((loco) => {
                loco.functionState = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
            })
            setState(tempState)
        })

        ipcRenderer.send('getLocos')

        let tempState = { ...state }
        tempState.locos = tempLocos
        setState(tempState)

        ipcRenderer.on('addLoco', (event) => {
            let tempState = { ...state }
            let tempDefault = { ...defaultLoco }
            tempDefault.functionState = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
            tempState.locos.push(tempDefault)
            setState(tempState)
        })

        ipcRenderer.on('hereIsYourImage', (event, name) => {
            var tempState = { ...state }
            tempState.locos[state.selectedLoco].photo = name
            setState(tempState)
        })
        return () => {
            ipcRenderer.removeAllListeners('hereIsYourImage')
            ipcRenderer.removeAllListeners('addLoco')
        }
    }, [])

    /*
        useEffect(() => {
            console.log(state)
        }, [state])
    */

    const setTrack = (track) => {
        let tempState = { ...state }
        tempState.activeTrack = track
        setState(tempState)
    }

    const deleteLoco = (loco) => {
        var tempState = { ...state }
        tempState.locos.splice(loco, 1)

        if (state.selectedLoco >= tempState.locos.length - 1) {
            tempState.selectedLoco = tempState.locos.length - 1
        }

        if (tempState.locos.length === 0) {
            tempState.locos.push(defaultLoco)
            tempState.selectedLoco = 0
            setState(tempState)
            history.replace("/")
        } else {
            history.replace("/")
        }
    }

    const selectLoco = (locoIndex) => {
        console.log('IN SELECT LOCO ' + locoIndex)
        let tempState = { ...state }
        tempState.selectedLoco = locoIndex
        setState(tempState)
    }

    const speedChange = (theSpeed) => {
        var tempState = { ...state }

        tempState.locos[state.selectedLoco].speed = theSpeed

        setState(tempState)
    }

    const setFunction = (funNum, funVal) => {
        console.log('Set Function ' + funNum + funVal)

        var tempState = { ...state }

        tempState.locos[state.selectedLoco].functionState[funNum] = funVal

        setState(tempState)
    }

    const handleNameChange = (newName) => {
        console.log('Name change in top ' + newName)
        var tempState = { ...state }

        tempState.locos[state.selectedLoco].name = newName

        setState(tempState)
    }

    const handleModelChange = (newModel) => {
        console.log('Model change in top ' + newModel)
        var tempState = { ...state }

        tempState.locos[state.selectedLoco].model = newModel

        setState(tempState)
    }

    const handleNumberChange = (newNumber) => {
        console.log('Name change in top ' + newNumber)
        var tempState = { ...state }

        tempState.locos[state.selectedLoco].number = newNumber

        setState(tempState)
    }

    const handleAddressChange = (newAddress) => {
        console.log('Name change in top ' + newAddress)
        var tempState = { ...state }

        tempState.locos[state.selectedLoco].address = newAddress

        setState(tempState)
    }

    const handleVisible = () => {
        let tempState = { ...state }

        if (state.locos[state.selectedLoco].hidden) {
            tempState.locos[state.selectedLoco].hidden = false
        } else {
            tempState.locos[state.selectedLoco].hidden = true
        }

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

    const handleDirectionChange = (direction) => {
        var tempState = { ...state }

        tempState.locos[state.selectedLoco].direction = direction

        setState(tempState)
    }

    const handleSetAllStopped = () => {
        var tempState = { ...state }

        for (var i = 0; i < tempState.locos.length; i++) {
            tempState.locos[i].direction = 'stopped'
        }
        setState(tempState)
    }

    const openSettings = (idx) => {
        console.log('In Open Settings', idx)
        let tempState = { ...state }
        tempState.selectedLoco = idx
        setState(tempState)
        history.replace("/locoSettingsWindow")
    }

    const openMain = () => {
        let tempState = { ...state }
        if (state.locos[state.selectedLoco].hidden) {
            for (var count = 0; count < state.locos.length; count++) {
                if (!state.locos[count].hidden) {
                    tempState.selectedLoco = count
                    break
                }
            }
        }
        setState(tempState)
        history.replace("/")
    }

    const printState = () => {
        console.log(state)
    }

    const makeLocoSettings = () => {
        if (state.locos.length === 0) {
            return
        }
        return (
            <LocoSettings
                visibility={handleVisible}
                changeModel={handleModelChange}
                changeAddress={handleAddressChange}
                changeNumber={handleNumberChange}
                changeName={handleNameChange}
                hidden={state.locos[state.selectedLoco].hidden}
                decoder={state.locos[state.selectedLoco].decoder}
                loco={state.selectedLoco}
                data={state.locos[state.selectedLoco]}
                backToMain={openMain}
                deleteLoco={deleteLoco}
            />
        )
    }

    const makeLocoControl = () => {
        if (state.locos.length === 0) {
            return
        }
        return (
            <LocoControl
                setFunction={setFunction}
                speedChange={speedChange}
                changeDirection={handleDirectionChange}
                loco={state.locos[state.selectedLoco]}
            />
        )
    }

    const makeLocoIcons = () => {
        let locoIcons = []
        //console.log('START')
        //console.log(locoIcons.length)
        //console.log(locoIcons)

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
                            openSettings={openSettings}
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
                    <div style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }}>{makeLocoControl()}</div>
                    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                        <Switch>
                            <Route path="/locoSettingsWindow">{makeLocoSettings()}</Route>
                            <Route>
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
                                    <div style={{ height: '100%', width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <Layout activeTrack={state.activeTrack} setActiveTrack={setTrack} />
                                    </div>
                                </div>
                            </Route>
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    )
}


const locoControl = {
    backgroundColor: 'grey',
    width: '250px',
}

const toolBar = {
    backgroundColor: 'orange',
}