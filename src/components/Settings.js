import React from 'react'
import { Button } from 'react-bootstrap'

export default function Settings() {
    return (
        <div style={{ padding: '10px' }}>
            <div className='pageContainer'>
                <div><b>Settings</b></div>
                <hr />
                <div>
                    <Button
                        variant='warning'
                        style={{ marginLeft: '8px' }}
                        size="sm"
                        onClick={() => window.electron.send('backupConfig')}
                    >Backup</Button>
                    <Button
                        variant='danger'
                        style={{ marginLeft: '8px' }}
                        size="sm"
                        onClick={() => window.electron.send('restoreConfig')}
                    >Restore</Button>
                </div>
            </div>
        </div>
    )
}
