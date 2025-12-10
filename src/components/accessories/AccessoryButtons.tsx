import React, { useEffect, useState } from 'react'
import { Button } from '../../ui'
import { AccessoryAction } from '../../types'

interface AccessoryButtonState extends AccessoryAction {
    state: boolean;
}

export default function AccessoryButtons() {
    const [actions, setActions] = useState<AccessoryButtonState[]>([])

    useEffect(() => {
        window.electron.invoke('getAccessoryActions')
            .then((res: unknown) => setActions(res as AccessoryButtonState[]))
            .catch((err: unknown) => console.error(err))
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
                                window.electron.invoke('accessoryAction', {
                                    id: act.action,
                                    idx: act.idx
                                })
                                    .then((res: unknown) => setActions(res as AccessoryButtonState[]))
                                    .catch((err: unknown) => console.error(err))
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
