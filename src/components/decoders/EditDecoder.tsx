import React, { useEffect, useState } from 'react'
import { Button, Table, useTheme } from '../../ui'
import { Decoder, DecoderFunction } from '../../types'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export default function EditDecoder() {
    const theme = useTheme()
    const decoderID = useParams().decoderID
    const location = useLocation()
    const navigate = useNavigate()

    const makeFunctions = (): DecoderFunction[] => {
        let out: DecoderFunction[] = []
        for (let i = 0; i < 32; i++) {
            out.push({ name: '', action: 'toggle' })
        }
        return out
    }
    const defaultDecoder: Decoder = {
        _id: window.electron.uuid(),
        name: '',
        model: '',
        manufacturer: '',
        functions: makeFunctions()
    }

    const getDecoderByID = async (id: string): Promise<Decoder> => {
        return window.electron.invoke('getDecoderById', id) as any
    }

    const makeState = async () => {
        if (decoderID !== undefined) {
            try {
                let theDecoder = await getDecoderByID(decoderID)
                setDecoder(JSON.parse(JSON.stringify(theDecoder)))
                setOgDecoder(JSON.parse(JSON.stringify(theDecoder)))
            } catch (err) {
                console.error(err)
            }
        }
    }

    const [decoder, setDecoder] = useState<Decoder>(defaultDecoder)
    const [ogDecoder, setOgDecoder] = useState<Decoder | null>(null)

    useEffect(() => {
        makeState()
    }, [])

    useEffect(() => {
        //console.log(decoder)
    }, [decoder])

    const readyToCreate = (): boolean => {
        if (decoder.name !== '' && decoder.model !== '' && decoder.manufacturer !== '') return true
        else return false
    }

    const readyToSave = (): boolean => {
        if (!readyToCreate()) return false
        if (JSON.stringify(ogDecoder) === JSON.stringify(decoder)) return false
        else return true
    }

    const handleCreate = () => {
        window.electron.invoke('createDecoder', decoder as any)
            .then(() => navigate('/decoders'))
            .catch((err: unknown) => console.log(err))
    }

    const handleSaveChanges = () => {
        window.electron.invoke('updateDecoder', decoder as any)
            .then(() => navigate('/decoders'))
            .catch((err: unknown) => console.log(err))
    }

    const makeButtons = () => {
        const createOrUpdate = (): React.ReactElement | undefined => {
            if (location.pathname.includes('new')) {
                return (
                    <Button size="sm" disabled={!readyToCreate()} onClick={handleCreate}>Create Decoder</Button>
                )
            } else if (location.pathname.includes('edit')) {
                return (
                    <Button size="sm" disabled={!readyToSave()} onClick={handleSaveChanges}>Save Changes</Button>
                )
            }
            return undefined
        }

        return (
            <div style={{ borderTop: `1px solid ${theme.colors.gray[600]}`, textAlign: 'right', paddingTop: theme.spacing.sm }}>
                <Button size="sm" variant="secondary" onClick={() => navigate('/decoders')}>Cancel</Button>
                <div style={{ width: theme.spacing.sm, display: 'inline-block' }} />
                {createOrUpdate()}
            </div>
        )
    }

    const makeChannels = (): React.ReactElement[] => {
        let out: React.ReactElement[] = []
        decoder.functions.forEach((func: DecoderFunction, i: number) => {
            out.push(
                <tr key={`functionChannel${i}`}>
                    <td><b>{i}</b></td>
                    <td>
                        <input
                            spellCheck="true"
                            placeholder='Enter Function Name'
                            value={func.name}
                            onChange={(e) => {
                                setDecoder((old: Decoder) => {
                                    let tempFuncs = [...old.functions]
                                    tempFuncs[i].name = e.target.value
                                    return { ...old, functions: tempFuncs }
                                })
                            }}
                            style={{
                                width: '100%',
                                backgroundColor: theme.colors.gray[800],
                                color: theme.colors.light,
                                border: `1px solid ${theme.colors.gray[600]}`,
                                borderRadius: theme.borderRadius.sm,
                                padding: theme.spacing.xs
                            }}
                        />
                    </td>
                    <td>
                        <div style={{ display: 'flex', gap: '0' }}>
                            <Button
                                size="sm"
                                variant={func.action === 'toggle' ? 'primary' : 'secondary'}
                                onClick={() => setDecoder((old: Decoder) => {
                                    let tempFuncs = [...old.functions]
                                    tempFuncs[i].action = 'toggle'
                                    return { ...old, functions: tempFuncs }
                                })}
                                style={{ borderRadius: '4px 0 0 4px' }}
                            >Toggle</Button>
                            <Button
                                size="sm"
                                variant={func.action === 'momentary' ? 'primary' : 'secondary'}
                                onClick={() => setDecoder((old: Decoder) => {
                                    let tempFuncs = [...old.functions]
                                    tempFuncs[i].action = 'momentary'
                                    return { ...old, functions: tempFuncs }
                                })}
                                style={{ borderRadius: '0 4px 4px 0' }}
                            >Momentary</Button>
                        </div>
                    </td>
                </tr>
            )
        })
        return out
    }

    const makeLabel = (): React.ReactElement | undefined => {
        if (location.pathname.includes('edit')) {
            return <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>Edit Decoder</div>
        } else if (location.pathname.includes('new')) {
            return <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>New Decoder</div>
        }
        return undefined
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
            <div className='pageContainer'>
                {makeLabel()}
                <hr style={{ borderColor: theme.colors.gray[600] }} />
                <div style={{ padding: theme.spacing.md }}>
                    <div>
                        <div style={{ display: 'inline-block' }}>
                            <Table size="sm">
                                <tbody>
                                    <tr>
                                        <td style={labelStyle}>Name</td>
                                        <td><input
                                            style={{
                                                width: '100%',
                                                backgroundColor: theme.colors.gray[800],
                                                color: theme.colors.light,
                                                border: `1px solid ${theme.colors.gray[600]}`,
                                                borderRadius: theme.borderRadius.sm,
                                                padding: theme.spacing.xs
                                            }}
                                            placeholder='Decoder Name'
                                            value={decoder.name}
                                            onChange={(e) => setDecoder((old: Decoder) => ({ ...old, name: e.target.value }))}
                                        /></td>
                                    </tr>
                                    <tr>
                                        <td style={labelStyle}>Model</td>
                                        <td><input
                                            style={{
                                                width: '100%',
                                                backgroundColor: theme.colors.gray[800],
                                                color: theme.colors.light,
                                                border: `1px solid ${theme.colors.gray[600]}`,
                                                borderRadius: theme.borderRadius.sm,
                                                padding: theme.spacing.xs
                                            }}
                                            placeholder='Decoder Model'
                                            value={decoder.model}
                                            onChange={(e) => setDecoder((old: Decoder) => ({ ...old, model: e.target.value }))}
                                        /></td>
                                    </tr>
                                    <tr>
                                        <td style={labelStyle}>Manufacturer</td>
                                        <td><input
                                            style={{
                                                width: '100%',
                                                backgroundColor: theme.colors.gray[800],
                                                color: theme.colors.light,
                                                border: `1px solid ${theme.colors.gray[600]}`,
                                                borderRadius: theme.borderRadius.sm,
                                                padding: theme.spacing.xs
                                            }}
                                            placeholder='Decoder Manufacturer'
                                            value={decoder.manufacturer}
                                            onChange={(e) => setDecoder((old: Decoder) => ({ ...old, manufacturer: e.target.value }))}
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

const labelStyle: React.CSSProperties = { textAlign: 'right' }