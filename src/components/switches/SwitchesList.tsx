import React, { useEffect, useState } from 'react'
import { Switch } from '../../types'
import { useNavigate } from 'react-router-dom'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import { Table, Button } from '../../ui';

export default function SwitchesList() {
    const navigate = useNavigate()
    const [switches, setSwitches] = useState<Switch[]>([])

    useEffect(() => {
        window.electron.invoke('getSwitches')
            .then((res: unknown) => {
                console.log(res)
                setSwitches(res as Switch[])
            })
            .catch((err: unknown) => console.log(err))
    }, [])

    return (
        <div className='pageContainer'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Switches</b>
                <Button variant='secondary' size='sm' onClick={() => navigate('/system/switches/new')}>
                    <AddCircleTwoToneIcon style={{ fontSize: '18px', marginRight: '4px' }} />
                    Add Switch
                </Button>
            </div>
            <div style={{ display: 'inline-block' }} >
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Open</th>
                            <th>Close</th>
                            <th>Edit</th>
                            <th>Del</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            switches.map((switchh, idx) => (
                                <tr key={(switchh)._id + "switchRow"}>
                                    <td>{switchh.name}</td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant={switchh.state ? 'success' : 'secondary'}
                                            onClick={() => {
                                                window.electron.invoke('setSwitch', switchh._id, 'open')
                                                    .then((res: unknown) => {
                                                        let tempSwitches = [...switches]
                                                        tempSwitches[idx].state = res as boolean
                                                        setSwitches(tempSwitches)
                                                    })
                                                    .catch((err: unknown) => console.log(err))
                                            }}
                                        >Open</Button>
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant={switchh.state ? 'secondary' : 'success'}
                                            onClick={() => {
                                                window.electron.invoke('setSwitch', switchh._id, 'close')
                                                    .then((res: unknown) => {
                                                        let tempSwitches = [...switches]
                                                        tempSwitches[idx].state = res as boolean
                                                        setSwitches(tempSwitches)
                                                    })
                                                    .catch((err: unknown) => console.log(err))
                                            }}
                                        >Close</Button>
                                    </td>
                                    <td>
                                        <div
                                            style={{ display: 'inline-block', cursor: 'pointer' }}
                                            onClick={() => navigate('/system/switches/edit/' + switchh._id)}
                                        >
                                            <EditTwoToneIcon />
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'inline-block', cursor: 'pointer', color: 'red' }}>
                                            <DeleteForeverTwoToneIcon />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </div>
        </div >
    )
}
