import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'

export default function AccessoryButtons() {
    const [actions, setActions] = useState([])

    useEffect(() => {
        window.electron.ipcRenderer.invoke('getAccessoryActions')
            .then(res => setActions(res))
            .catch(err => console.error(err))
    }, [])

    return (
        <div style={{ display: 'inline-blocks' }}>
            <div>
                {
                    actions.map((act, i) => (
                        <Button
                            key={`actionButton${i}`}
                            style={{ marginRight: '10px' }}
                            size='sm'
                            variant={act.state ? 'success' : 'outline-secondary'}
                            onClick={() => {
                                window.electron.ipcRenderer.invoke('accessoryAction', {
                                    id: act.action,
                                    idx: act.idx
                                })
                                    .then(res => setActions(res))
                                    .catch(err => console.error(err))
                            }}
                        >
                            {act.name}
                        </Button>
                    ))
                }
            </div>
        </div>
    )
}
