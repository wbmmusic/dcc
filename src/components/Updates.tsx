import React, { Fragment, useEffect, useState } from 'react'
import { IconButton, Snackbar } from '../ui'
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '../ui/Button';

export default function Updates() {
    const defaultDownloadSnack = { show: false, progress: 0 }
    const defaultInstallSnack = { show: false, version: 'x.x.x' }
    const [downloadSnack, setDownloadSnack] = useState(defaultDownloadSnack)
    const [installSnack, setInstallSnack] = useState(defaultInstallSnack)

    const handleClose = (event: unknown, reason: string) => {
        if (reason === 'clickaway') return
        setDownloadSnack({ show: false, progress: 0 });
    };

    const install = () => window.electron.send('installUpdate')

    const closeInstallSnack = () => setInstallSnack(old => ({ ...old, show: false }))

    const action = (
        <Fragment>
            <IconButton
                size="small"
                color="inherit"
                onClick={handleClose}
                title="Close"
            >
                <CloseIcon style={{ fontSize: '16px' }} />
            </IconButton>
        </Fragment>
    );

    const installAction = (
        <Fragment>
            <Button variant='danger' size="sm" onClick={() => install()}>Relaunch App</Button>
            <IconButton
                size="small"
                color="inherit"
                onClick={closeInstallSnack}
                title="Close"
            >
                <CloseIcon style={{ fontSize: '16px' }} />
            </IconButton>
        </Fragment>
    );

    useEffect(() => {
        window.electron.send('reactIsReady')
        window.electron.receive('updater', (a: unknown, b: unknown) => {
            if (a === 'checking-for-update') console.log("Checking For Update")
            else if (a === 'update-not-available') console.log("Up to date: v" + (b as any)?.version)
            else if (a === 'update-available') setDownloadSnack(old => ({ show: true, progress: 0 }))
            else if (a === 'download-progress') {
                console.log("Downloading", Math.round((b as any)?.percent || 0) + "%")
                setDownloadSnack(old => ({ ...old, progress: Math.round((b as any)?.percent || 0) }))
            }
            else if (a === 'update-downloaded') {
                console.log("Downloaded", b)
                setDownloadSnack(defaultDownloadSnack)
                setInstallSnack({ show: true, version: (b as any)?.tag || 'unknown' })
            }
            else if (a === 'error') console.log("Update Error", b)
            else console.log(a, b)
        })

        return () => window.electron.removeListener('updater')
    }, [])

    return (
        <div>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={downloadSnack.show}
                autoHideDuration={30000}
                onClose={handleClose}
                message={`Downloading Update ${downloadSnack.progress}%`}
                action={action}
            />
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={installSnack.show}
                autoHideDuration={30000}
                onClose={handleClose}
                message={`Relaunch to install ${installSnack.version}`}
                action={installAction}
            />
        </div>
    )
}
