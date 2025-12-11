import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Button, Table, Select, Modal, theme } from '../../ui'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid';
import { Decoder, LocomotiveForm, locomotiveDataToForm, locomotiveFormToData, SelectOption } from '../../types';

export default function EditLocomotive() {
    const locoID = useParams().locoID
    const location = useLocation()
    const navigate = useNavigate()

    const defaultLoco: LocomotiveForm = {
        _id: uuid(),
        hidden: false,
        name: '',
        number: '',
        address: '',
        model: '',
        photo: 'default.jpg',
        decoder: '',
    }

    const [loco, setLoco] = useState<LocomotiveForm>(defaultLoco)
    const [ogLoco, setOgLoco] = useState<LocomotiveForm | null>(null)
    const [decoders, setDecoders] = useState<Decoder[]>([])
    const [loading, setLoading] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)
    const [pendingImage, setPendingImage] = useState<string | null>(null)

    const makeTitle = (): React.ReactElement | string => {
        if (location.pathname.includes('new')) {
            return <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>New Locomotive</div>
        } else if (location.pathname.includes('edit')) {
            return <div style={{ fontSize: theme.fontSize.lg, fontWeight: 'bold' }}>Edit Locomotive</div>
        } else return 'ERROR'
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const decodersData = await window.electron.invoke('getDecoders')
                setDecoders(decodersData as Decoder[])

                if (locoID) {
                    const locoData = await window.electron.invoke('getLocomotiveById', locoID)
                    const formData = locomotiveDataToForm(locoData as any)
                    setLoco(formData)
                    setOgLoco(formData)
                }
            } catch (error) {
                console.error('Failed to load locomotive data:', error)
            }
        }
        loadData()
    }, [locoID])

    useEffect(() => console.log(loco), [loco])

    const handelCreateLoco = async () => {
        setLoading(true)
        try {
            const locoData = locomotiveFormToData(loco)
            await window.electron.invoke('createLoco', locoData as any)
            navigate('/system/locomotives')
        } catch (error) {
            console.error('Failed to create locomotive:', error)
        } finally {
            setLoading(false)
        }
    }

    const readyToCreate = (): boolean => {
        if (loco.name !== '' && loco.decoder !== '' && loco.address !== '' && !isNaN(parseInt(loco.address))) return true
        else return false
    }

    const decoderOptions = useMemo((): SelectOption[] => {
        return decoders.map((decoder: Decoder) => ({
            label: `${decoder.name} ${decoder.model}`,
            value: decoder._id
        }))
    }, [decoders])

    const selectedDecoder = useMemo((): SelectOption | null => {
        const decoder = decoders.find((dcdr: Decoder) => dcdr._id === loco.decoder)
        if (!decoder) return null
        return { label: `${decoder.name} ${decoder.model}`, value: decoder._id }
    }, [decoders, loco.decoder])

    const readyToUpdate = (): boolean => {
        if (!readyToCreate()) return false
        if (JSON.stringify(loco) === JSON.stringify(ogLoco)) return false
        return true
    }

    const handleUpdateLoco = async () => {
        setLoading(true)
        try {
            const locoData = locomotiveFormToData(loco)
            await window.electron.invoke('updateLocomotive', locoData as any)
            navigate('/system/locomotives')
        } catch (error) {
            console.error('Failed to update locomotive:', error)
        } finally {
            setLoading(false)
        }
    }

    const makeButtons = () => {

        const makeSaveUpdate = (): React.ReactElement | string => {
            if (location.pathname.includes('new')) {
                return <Button variant='success' size='sm' disabled={!readyToCreate()} loading={loading} onClick={handelCreateLoco} >Create Locomotive</Button>
            } else if (location.pathname.includes('edit')) {
                return <Button variant='success' disabled={!readyToUpdate()} loading={loading} onClick={handleUpdateLoco} size='sm'>Update Locomotive</Button>
            } else return "ERROR"
        }

        return (
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <Button variant="secondary" size='sm' onClick={() => navigate('/system/locomotives')} >Cancel</Button>
                <div style={{ display: 'inline-block', width: theme.spacing.sm }} />
                {makeSaveUpdate()}
            </div>
        )

    }

    const makeFunctions = (): React.ReactElement[] | string => {
        let out: React.ReactElement[] = []
        if (decoders.length <= 0 || loco.decoder === '') return out

        const decoderIDX = decoders.findIndex((decoder: Decoder) => decoder._id === loco.decoder)
        if (decoderIDX < 0) return 'ERROR'

        decoders[decoderIDX].functions.forEach((func, i: number) => {
            if (func.name !== '') out.push(
                <tr key={`${func.name}${i}`}>
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
            <hr style={{ borderColor: theme.colors.gray[600] }} />
            
            {/* Basic Information Section */}
            <div style={sectionStyle}>
                <div style={sectionTitleStyle}>Basic Information</div>
                <Table size='sm' borderless>
                    <tbody>
                        <tr>
                            <td style={labelStyle}>Name</td>
                            <td>
                                <input
                                    style={inputStyle}
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
                                    style={inputStyle}
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
                                    style={inputStyle}
                                    type="number"
                                    value={loco.number}
                                    placeholder='1234'
                                    onChange={(e) => setLoco(old => ({ ...old, number: e.target.value }))}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td style={labelStyle}>Address</td>
                            <td>
                                <input
                                    style={inputStyle}
                                    type="number"
                                    value={loco.address}
                                    placeholder='1234'
                                    onChange={(e) => setLoco(old => ({ ...old, address: e.target.value }))}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td style={labelStyle}>Decoder</td>
                            <td>
                                <Select
                                    value={selectedDecoder || undefined}
                                    onChange={(option: SelectOption) => setLoco(old => ({ ...old, decoder: option.value as string }))}
                                    options={decoderOptions}
                                    placeholder="Select decoder..."
                                />
                            </td>
                        </tr>
                        <tr>
                            <td style={labelStyle}>Hidden</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={loco.hidden}
                                    onChange={(e) => setLoco(old => ({ ...old, hidden: e.target.checked }))}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                                <span style={{ marginLeft: '8px', fontSize: theme.fontSize.sm, color: theme.colors.gray[300] }}>
                                    Hide this locomotive from the main bar
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>

            {/* Functions Section */}
            <div style={{ ...sectionStyle, marginTop: theme.spacing.md }}>
                <div style={sectionTitleStyle}>Decoder Functions</div>
                <Table striped size='sm'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {makeFunctions()}
                    </tbody>
                </Table>
            </div>

            {/* Photo Section */}
            <div style={{ ...sectionStyle, marginTop: theme.spacing.md }}>
                <div style={sectionTitleStyle}>Locomotive Photo</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing.md }}>
                    <div style={photoPreviewStyle}>
                        <img style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} src={`loco://${loco.photo}`} alt='loco' />
                    </div>
                    <Button
                        size='sm'
onClick={async () => {
                            try {
                                const res = await window.electron.invoke('selectLocoImage')
                                if (res !== 'canceled' && res !== 'error') {
                                    if (loco.photo !== 'default.jpg') {
                                        setPendingImage(res as string)
                                        setShowImageModal(true)
                                    } else {
                                        setLoco(old => ({ ...old, photo: res as string }))
                                    }
                                }
                            } catch (error) {
                                console.error('Failed to select image:', error)
                            }
                        }}
                    >Choose Image</Button>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: theme.spacing.md }}>
                {makeButtons()}
            </div>

            <Modal
                show={showImageModal}
                onClose={() => {
                    setShowImageModal(false)
                    setPendingImage(null)
                }}
                title="Replace Image"
                footer={
                    <>
                        <Button variant="secondary" size="sm" onClick={() => {
                            setShowImageModal(false)
                            setPendingImage(null)
                        }}>Cancel</Button>
                        <Button variant="success" size="sm" onClick={() => {
                            if (pendingImage) {
                                setLoco(old => ({ ...old, photo: pendingImage }))
                            }
                            setShowImageModal(false)
                            setPendingImage(null)
                        }}>Replace</Button>
                    </>
                }
            >
                Replace current locomotive image with the selected file?
            </Modal>
        </div >
    )
}

const labelStyle: React.CSSProperties = { 
    textAlign: 'right', 
    fontWeight: 'bold',
    paddingRight: theme.spacing.md,
    whiteSpace: 'nowrap',
}

const sectionStyle = {
    backgroundColor: theme.colors.gray[800],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.gray[600]}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
}

const sectionTitleStyle = {
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    color: theme.colors.warning,
    borderBottom: `2px solid ${theme.colors.gray[600]}`,
    paddingBottom: theme.spacing.sm,
}

const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    fontSize: theme.fontSize.sm,
    border: `1px solid ${theme.colors.gray[600]}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray[800],
    color: theme.colors.light,
}

const photoPreviewStyle = {
    width: '300px',
    height: '180px',
    backgroundColor: theme.colors.gray[900],
    border: `2px solid ${theme.colors.gray[600]}`,
    borderRadius: theme.borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
}