import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import { selectStyle } from '../../styles';
const { v4: uuid } = require('uuid');

export default function EditLocomotive() {
    const locoID = useParams().locoID
    const location = useLocation()
    const navigate = useNavigate()

    const defaultLoco = {
        _id: uuid(),
        hidden: false,
        name: '',
        number: '',
        address: '',
        model: '',
        photo: 'default.jpg',
        decoder: '',
    }

    const [loco, setLoco] = useState(defaultLoco)
    const [ogLoco, setOgLoco] = useState(null)
    const [decoders, setDecoders] = useState([])

    const makeTitle = () => {
        if (location.pathname.includes('new')) {
            return <b>New Locomotive</b>
        } else if (location.pathname.includes('edit')) {
            return <b>Edit Locomotive</b>
        } else return 'ERROR'
    }

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getDecoders')
            .then(res => setDecoders(res))
            .catch(err => console.log(err))

        if (locoID !== undefined) {
            window.electron.ipcRenderer.invoke('getLocomotiveById', locoID)
                .then(theLoco => {
                    setLoco(theLoco)
                    setOgLoco(theLoco)
                })
                .catch(err => console.log(err))
        }
    }, [])

    useEffect(() => console.log(loco), [loco])

    const handelCreateLoco = () => {
        window.electron.ipcRenderer.invoke('createLoco', loco)
            .then(navigate('/locomotives'))
            .catch(err => console.log(err))
    }

    const readyToCreate = () => {
        if (loco.name !== '' && loco.decoder !== '' && loco.address !== '' && !isNaN(loco.address)) return true
        else return false
    }

    const makeDecoderOptions = () => {
        let out = []
        decoders.forEach(dcdr => {
            out.push({
                label: `${dcdr.name} ${dcdr.model}`,
                value: dcdr._id
            })
        })
        return out
    }

    const makeSelectValue = () => {
        let decoder = decoders.find(dcdr => dcdr._id === loco.decoder)
        if (decoder === undefined) return null
        return { label: `${decoder.name} ${decoder.model}`, value: decoder._id }
    }

    const readyToUpdate = () => {
        if (!readyToCreate()) return false
        if (JSON.stringify(loco) === JSON.stringify(ogLoco)) return false
        return true
    }

    const handleUpdateLoco = () => {
        window.electron.ipcRenderer.invoke('updateLocomotive', loco)
            .then(theLoco => navigate('/locomotives'))
            .catch(err => console.log(err))
    }

    const makeButtons = () => {

        const makeSaveUpdate = () => {
            if (location.pathname.includes('new')) {
                return <Button size='sm' disabled={!readyToCreate()} onClick={handelCreateLoco} >Create Locomotive</Button>
            } else if (location.pathname.includes('edit')) {
                return <Button disabled={!readyToUpdate()} onClick={handleUpdateLoco} size='sm'>Update Locomotive</Button>
            } else return "ERROR"
        }

        return (
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <Button variant="secondary" size='sm' onClick={() => navigate(-1)} >Close</Button>
                <div style={{ display: 'inline-block', width: '8px' }} />
                {makeSaveUpdate()}
            </div>
        )

    }

    const makeFunctions = () => {
        let out = []
        if (decoders.length <= 0 || loco.decoder === '') return out

        const decoderIDX = decoders.findIndex(dcdr => dcdr._id === loco.decoder)
        if (decoderIDX < 0) return 'ERROR'

        decoders[decoderIDX].functions.forEach((func, i) => {
            if (func.name !== '') out.push(
                <tr key={func + i}>
                    <td>{i}</td>
                    <td>{func.name}</td>
                    <td>{func.action}</td>
                </tr>
            )
        })

        return out
    }


    return (
        <div className='pageContainer'>
            {makeTitle()}
            <hr />
            <div>
                <div style={{ display: 'inline-block' }}>
                    <Table size='sm' >
                        <tbody>
                            <tr>
                                <td style={labelStyle}>Name</td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder='Loco Name'
                                        value={loco.name}
                                        onChange={(e) => setLoco(old => ({ ...old, name: e.target.value }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Model</td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder='Loco Model'
                                        value={loco.model}
                                        onChange={(e) => setLoco(old => ({ ...old, model: e.target.value }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Number</td>
                                <td>
                                    <input
                                        type="number"
                                        value={loco.number}
                                        placeholder='1234'
                                        onChange={(e) => setLoco(old => ({ ...old, number: parseInt(e.target.value) }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Address</td>
                                <td>
                                    <input
                                        type="number"
                                        value={loco.address}
                                        placeholder='1234'
                                        onChange={(e) => setLoco(old => ({ ...old, address: parseInt(e.target.value) }))}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={labelStyle}>Decoder</td>
                                <td>
                                    <Select
                                        styles={selectStyle}
                                        value={makeSelectValue()}
                                        onChange={(e) => setLoco(old => ({ ...old, decoder: e.value }))}
                                        options={makeDecoderOptions()}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
            <div>
                FUNCTIONS
                <div>
                    <div style={{ display: 'inline-block' }}>
                        <Table striped size='sm'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>#</th>
                                </tr>
                            </thead>
                            <tbody>
                                {makeFunctions()}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
            <hr />
            <div id='photoInput' style={{ backgroundColor: 'lightGrey', display: 'inline-block', padding: '10px' }}>
                <b>Photo</b>
                <div>
                    <div style={{ maxWidth: '100%' }}>
                        <img style={{ maxWidth: '100%', maxHeight: '200px' }} src={`loco://${loco.photo}`} alt='loco' />
                    </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                    <Button
                        size='sm'
                        onClick={() => {
                            window.electron.ipcRenderer.invoke('selectLocoImage')
                                .then(res => { if (res !== 'canceled') setLoco(old => ({ ...old, photo: res })) })
                                .catch(err => console.log(err))
                        }}
                    >Choose Image</Button>
                </div>
            </div>
            <hr />
            {makeButtons()}
        </div >
    )
}

const labelStyle = { textAlign: 'right' }