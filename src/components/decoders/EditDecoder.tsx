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
    const [loading, setLoading] = useState(false)

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

    const handleCreate = async () => {
        setLoading(true)
        try {
            await window.electron.invoke('createDecoder', decoder as any)
            navigate('/system/decoders')
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveChanges = async () => {
        setLoading(true)
        try {
            await window.electron.invoke('updateDecoder', decoder as any)
            navigate('/system/decoders')
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const makeButtons = () => {
        const createOrUpdate = (): React.ReactElement | undefined => {
            if (location.pathname.includes('new')) {
                return (
                    <Button variant="success" size="sm" disabled={!readyToCreate()} loading={loading} onClick={handleCreate}>Create Decoder</Button>
                )
            } else if (location.pathname.includes('edit')) {
                return (
                    <Button variant="success" size="sm" disabled={!readyToSave()} loading={loading} onClick={handleSaveChanges}>Save Changes</Button>
                )
            }
            return undefined
        }

        return (
            <div style={{ borderTop: `1px solid ${theme.colors.gray[600]}`, textAlign: 'right', paddingTop: theme.spacing.sm }}>
                <Button size="sm" variant="secondary" onClick={() => navigate('/system/decoders')}>Cancel</Button>
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
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: theme.colors.warning }}>{i}</td>
                    <td>
                        <input
                            spellCheck="true"
                            placeholder={`F${i} Function Name`}
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
                                backgroundColor: theme.colors.gray[700],
                                color: theme.colors.light,
                                border: `1px solid ${theme.colors.gray[500]}`,
                                borderRadius: theme.borderRadius.sm,
                                padding: theme.spacing.xs,
                                fontSize: theme.fontSize.sm
                            }}
                        />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0', justifyContent: 'center' }}>
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
        <div className='pageContainer'>
            {makeLabel()}
            <hr style={{ borderColor: theme.colors.gray[600] }} />
                    <div style={{
                        backgroundColor: theme.colors.gray[800],
                        border: `1px solid ${theme.colors.gray[600]}`,
                        borderRadius: theme.borderRadius.md,
                        padding: theme.spacing.md,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        marginBottom: theme.spacing.md
                    }}>
                        <div style={{ fontSize: theme.fontSize.md, fontWeight: 'bold', marginBottom: theme.spacing.md }}>Decoder Information</div>
                        <Table size="sm">
                            <tbody>
                                <tr>
                                    <td style={labelStyle}>Name</td>
                                    <td><input
                                        style={{
                                            width: '100%',
                                            backgroundColor: theme.colors.gray[700],
                                            color: theme.colors.light,
                                            border: `1px solid ${theme.colors.gray[500]}`,
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
                                            backgroundColor: theme.colors.gray[700],
                                            color: theme.colors.light,
                                            border: `1px solid ${theme.colors.gray[500]}`,
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
                                            backgroundColor: theme.colors.gray[700],
                                            color: theme.colors.light,
                                            border: `1px solid ${theme.colors.gray[500]}`,
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
                    
                    <div style={{
                        backgroundColor: theme.colors.gray[800],
                        border: `1px solid ${theme.colors.gray[600]}`,
                        borderRadius: theme.borderRadius.md,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ 
                            padding: theme.spacing.md, 
                            borderBottom: `1px solid ${theme.colors.gray[600]}`,
                            fontSize: theme.fontSize.md, 
                            fontWeight: 'bold' 
                        }}>Function Configuration</div>
                        <Table size="sm" striped>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center', width: '60px' }}>#</th>
                                    <th>Function Name</th>
                                    <th style={{ textAlign: 'center', width: '200px' }}>Action Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {makeChannels()}
                            </tbody>
                        </Table>
                    </div>
            {makeButtons()}
        </div>
    )
}

const labelStyle: React.CSSProperties = { textAlign: 'right' }