import React from 'react'
import { Button } from 'react-bootstrap';
const path = require('path')

const { ipcRenderer } = window.require('electron');

export default function LocoSettings(props) {

    const backToMain = () => {
        props.backToMain()
    }

    const handleNameChange = (e) => {
        console.log('Settings name change to ' + e.target.value)
        props.changeName(e.target.value)
    }

    const handleModelChange = (e) => {
        console.log('Model name change to ' + e.target.value)
        props.changeModel(e.target.value)
    }

    const handleNumberChange = (e) => {
        console.log('Settings number change to ' + e.target.value)
        props.changeNumber(e.target.value)

        // If link checked
        props.changeAddress(e.target.value)
    }

    const chooseImage = () => {
        ipcRenderer.send('chooseImage')
    }

    const handleAddressChange = (e) => {
        console.log('Address Change')
    }

    const handleVisible = (e) => {
        console.log('visibility change to ')
        //props.changeModel(e.target.value)
        console.log(e.target)

        props.visibility()
    }

    const handleAddLinkChange = (e) => {
        console.log('Add Link change ' + e.target.value)
        //props.changeNumber(e.target.value)

        // If link checked
        //props.changeAddress(e.target.value)
    }

    const handleDeleteLoco = () => {
        console.log('in Delete loco' + props.loco)

        var shouldDelete = window.confirm('You are about to delete this locomotive');
        if (shouldDelete) {
            props.deleteLoco(props.loco)
        }
    }


    let functionTable = []

    let visibleStat = (
        <input
            type="checkbox"
            onChange={handleVisible}
            checked
        />
    )

    if (props.hidden) {
        visibleStat = (
            <input
                type="checkbox"
                onChange={handleVisible}
            />
        )
    }

    functionTable.push(
        <tr key="FunTblLabels">
            <td style={numberCell}><b>#</b></td>
            <td style={nameCell}><b>Function</b></td>
            <td style={showCell}><b>Show</b></td>
            <td style={{ width: '50px' }}></td>
            <td style={numberCell}><b>#</b></td>
            <td style={nameCell}><b>Function</b></td>
            <td style={showCell}><b>Show</b></td>
        </tr>
    )

    for (var i = 0; i < 16; i++) {
        var plus0 = ''
        var plus16 = ''

        if (props.decoder.functions[i].info[2]) {
            plus0 = (<input type="checkbox" checked />)
        }

        if (props.decoder.functions[i + 16].info[2]) {
            plus16 = (<input type="checkbox" checked />)
        }

        var tempKey = "funBtnTblRow" + i + "+" + (i + 16)

        functionTable.push(
            <tr key={tempKey}>
                <td style={numberCell}>{i}</td>
                <td style={nameCell}>{props.decoder.functions[i].info[1]}</td>
                <td style={showCell}>{plus0}</td>
                <td></td>
                <td style={numberCell}>{i + 16}</td>
                <td style={nameCell}>{props.decoder.functions[i + 16].info[1]}</td>
                <td style={showCell}>{plus16}</td>
            </tr>
        )
    }


    return (
        <div style={{
            overflow: 'auto',
            height: '100%',
            padding: '10px'
        }}>
            <div>
                <b>Locomotive Settings</b>
                <Button size="sm" variant="outline-secondary" style={{ marginLeft: '10px' }} onMouseDown={backToMain}>Close Settings</Button>
            </div>

            <hr />

            <div
                style={{
                    border: '1px black solid',
                    display: 'inline-block',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: 'lightgrey'
                }}
            >
                <b>General</b>
                <hr />

                <table>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: 'right' }}>Name:</td>
                            <td>
                                <input
                                    value={props.data.name}
                                    onChange={handleNameChange}
                                />
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'right' }}>Number:</td>
                            <td>
                                <input
                                    type='number'
                                    value={props.data.number}
                                    onChange={handleNumberChange}
                                />
                            </td>
                            <td rowSpan='2'>
                                -|
                                <br />
                                <input
                                    type='checkbox'
                                    onChange={handleAddLinkChange}
                                    checked
                                />
                                🔗
                                <br />
                                -|
                        </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'right' }}>Address:</td>
                            <td>
                                <input
                                    type='number'
                                    value={props.data.address}
                                    onChange={handleAddressChange}
                                    min='0'
                                    max='9999'
                                />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'right' }}>Model:</td>
                            <td>
                                <input
                                    value={props.data.model}
                                    onChange={handleModelChange}
                                />
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'right' }}>Visable:</td>
                            <td>
                                {visibleStat}
                            </td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <hr />

            <div
                style={{
                    border: '1px black solid',
                    display: 'inline-block',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: 'lightgrey'
                }}
            >
                <b>Image</b>
                <div style={{ fontSize: '12px', display: 'inline-block', marginLeft: '10px', marginRight: '10px' }}>
                    {props.data.photo}
                </div>
                <Button size="sm" variant="outline-secondary" onMouseDown={chooseImage}>Choose Image</Button>
                <hr />


                <div style={{
                    width: '320px',
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img
                        width='100%'
                        src={path.join('C:/', 'ProgramData', 'WBM Tek', 'dcc', 'locos', 'images', props.data.photo)}
                        alt='Locomotive'
                    />
                </div>
            </div>

            <hr />

            <div
                style={{
                    border: '1px black solid',
                    display: 'inline-block',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: 'lightgrey'
                }}
            >
                <b>Function Buttons</b>
                <hr />

                <table cellSpacing='0' cellPadding="4px" style={{ fontSize: '14px', width: '100%' }}>
                    <tbody>
                        {functionTable}
                    </tbody>
                </table>
            </div>
            <hr />
            <div style={{ paddingBlock: '5px' }}>
                <Button size="sm" variant="secondary" onMouseDown={handleDeleteLoco}>Delete Loco</Button>
            </div>
        </div>
    )
}


const nameCell = {
    border: '1px black solid',
}

const numberCell = {
    border: '1px black solid',
    textAlign: 'center'
}

const showCell = {
    border: '1px black solid',
    textAlign: 'center'
}