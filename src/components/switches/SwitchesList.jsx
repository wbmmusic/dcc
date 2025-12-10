import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import { Table, Button } from '../../ui';

export default function SwitchesList() {
    const navigate = useNavigate()
    const [switches, setSwitches] = useState([])

    useEffect(() => {
        window.electron.invoke('getSwitches')
            .then(res => {
                console.log(res)
                setSwitches(res)
            })
            .catch(err => console.log(err))
    }, [])

    return (
        <div className='pageContainer'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Switches</b>
                <div
                    style={{ color: 'green', display: 'inline-block', cursor: 'pointer', marginLeft: '10px' }}
                    onClick={() => navigate('/system/switches/new')}
                >
                    <AddCircleTwoToneIcon />
                </div>
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
                                                    .then(res => {
                                                        let tempSwitches = [...switches]
                                                        tempSwitches[idx].state = res
                                                        setSwitches(tempSwitches)
                                                    })
                                                    .catch(err => console.log(err))
                                            }}
                                        >Open</Button>
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant={switchh.state ? 'secondary' : 'success'}
                                            onClick={() => {
                                                window.electron.invoke('setSwitch', switchh._id, 'close')
                                                    .then(res => {
                                                        let tempSwitches = [...switches]
                                                        tempSwitches[idx].state = res
                                                        setSwitches(tempSwitches)
                                                    })
                                                    .catch(err => console.log(err))
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
