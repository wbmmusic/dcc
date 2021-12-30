import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, Table } from 'react-bootstrap'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export default function EditDecoder() {
    const decoderID = useParams().decoderID
    const location = useLocation()
    const navigate = useNavigate()

    const makeFunctions = () => {
        let out = []
        for (let i = 0; i < 32; i++) {
            out.push({ name: '', action: 'toggle' })
        }
        return out
    }
    const defaultDecoder = {
        _id: window.electron.uuid(),
        name: '',
        model: '',
        manufacturer: '',
        functions: makeFunctions()
    }

    const getDecoderByID = async (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let decoder = window.electron.ipcRenderer.invoke('getDecoderById', id)
                resolve(decoder)
            } catch (error) {
                reject(error)
            }
        })


    }

    const makeState = async () => {
        if (decoderID !== undefined) {
            let theDecoder = await getDecoderByID(decoderID)
            setDecoder(JSON.parse(JSON.stringify(theDecoder)))
            setOgDecoder(JSON.parse(JSON.stringify(theDecoder)))
        }
    }

    const [decoder, setDecoder] = useState(defaultDecoder)
    const [ogDecoder, setOgDecoder] = useState(null)

    useEffect(() => {
        makeState()
    }, [])

    useEffect(() => {
        //console.log(decoder)
    }, [decoder])

    const readyToCreate = () => {
        if (decoder.name !== '' && decoder.model !== '' && decoder.manufacturer !== '') return true
        else return false
    }

    const readyToSave = () => {
        if (!readyToCreate()) return false
        if (JSON.stringify(ogDecoder) === JSON.stringify(decoder)) return false
        else return true
    }

    const handleCreate = () => {
        window.electron.ipcRenderer.invoke('createDecoder', decoder)
            .then(navigate('/decoders'))
            .catch(err => console.log(err))
    }

    const handleSaveChanges = () => {
        window.electron.ipcRenderer.invoke('updateDecoder', decoder)
            .then(navigate('/decoders'))
            .catch(err => console.log(err))
    }

    const makeButtons = () => {
        const createOrUpdate = () => {
            if (location.pathname.includes('new')) {
                return (
                    <Button size="sm" disabled={!readyToCreate()} onClick={handleCreate}>Create Decoder</Button>
                )
            } else if (location.pathname.includes('edit')) {
                return (
                    <Button size="sm" disabled={!readyToSave()} onClick={handleSaveChanges}>Save Changes</Button>
                )
            }
        }

        return (
            <div style={{ borderTop: '1px solid lightGrey', textAlign: 'right', paddingTop: '5px' }}>
                <Button size="sm" onClick={() => navigate('/decoders')}>Cancel</Button>
                <div style={{ width: '5px', display: 'inline-block' }} />
                {createOrUpdate()}
            </div>
        )
    }

    const makeChannels = () => {
        let out = []
        decoder.functions.forEach((func, i) => {
            out.push(
                <tr key={`functionChannel${i}`}>
                    <td><b>{i}</b></td>
                    <td>
                        <input
                            spellCheck="true"
                            placeholder='Enter Function Name'
                            value={func.name}
                            onChange={(e) => {
                                setDecoder(old => {
                                    let tempFuncs = [...old.functions]
                                    tempFuncs[i].name = e.target.value
                                    return { ...old, functions: tempFuncs }
                                })
                            }}
                        />
                    </td>
                    <td>
                        <ButtonGroup size="sm" >
                            <Button
                                variant={func.action === 'toggle' ? 'primary' : 'secondary'}
                                onClick={() => setDecoder(old => {
                                    let tempFuncs = [...old.functions]
                                    tempFuncs[i].action = 'toggle'
                                    return { ...old, functions: tempFuncs }
                                })}
                            >Toggle</Button>
                            <Button
                                variant={func.action === 'momentary' ? 'primary' : 'secondary'}
                                onClick={() => setDecoder(old => {
                                    let tempFuncs = [...old.functions]
                                    tempFuncs[i].action = 'momentary'
                                    return { ...old, functions: tempFuncs }
                                })}
                            >Momentary</Button>
                        </ButtonGroup>
                    </td>
                </tr>
            )
        })
        return out
    }

    const makeLabel = () => {
        if (location.pathname.includes('edit')) {
            return <div><b>Edit Decoder</b></div>
        } else if (location.pathname.includes('new')) {
            return <div><b>New Decoder</b></div>
        }
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
            <div className='pageContainer'>
                {makeLabel()}
                <hr />
                <div style={{ padding: '10px' }}>
                    <div>
                        <div style={{ display: 'inline-block' }}>
                            <Table size="sm">
                                <tbody>
                                    <tr>
                                        <td style={labelStyle}>Name</td>
                                        <td><input
                                            style={{ width: '100%' }}
                                            placeholder='Decoder Name'
                                            value={decoder.name}
                                            onChange={(e) => setDecoder(old => ({ ...old, name: e.target.value }))}
                                        /></td>
                                    </tr>
                                    <tr>
                                        <td style={labelStyle}>Model</td>
                                        <td><input
                                            style={{ width: '100%' }}
                                            placeholder='Decoder Model'
                                            value={decoder.model}
                                            onChange={(e) => setDecoder(old => ({ ...old, model: e.target.value }))}
                                        /></td>
                                    </tr>
                                    <tr>
                                        <td style={labelStyle}>Manufacturer</td>
                                        <td><input
                                            style={{ width: '100%' }}
                                            placeholder='Decoder Manufacturer'
                                            value={decoder.manufacturer}
                                            onChange={(e) => setDecoder(old => ({ ...old, manufacturer: e.target.value }))}
                                        /></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                    <Table size="sm" striped style={{ display: 'inline-block' }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Function</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {makeChannels()}
                        </tbody>
                    </Table>
                    {makeButtons()}
                </div>
            </div>
        </div>
    )
}

const labelStyle = { textAlign: 'right' }