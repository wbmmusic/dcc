import React from 'react'
import { Button } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'

export default function EditMacro() {
    const location = useLocation()
    const navigate = useNavigate()

    const makeButtons = () => {
        const makeButton = () => {
            if (location.pathname.includes('new')) {
                return <Button size='sm'>Create Macro</Button>
            } else if (location.pathname.includes('edit')) {
                return <Button size='sm'>Update Macro</Button>
            } else return "ERROR"
        }

        return (
            <div style={{ textAlign: 'right' }}>
                <Button size='sm' onClick={() => navigate('/macros')}>Cancel</Button>
                <div style={{ display: 'inline-block', width: '8px' }} />
                {makeButton()}
            </div>
        )
    }

    return (
        <div>
            <h3>Edit Macro</h3>
            {makeButtons()}
        </div>
    )
}
