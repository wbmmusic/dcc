import React from 'react'
import { Button } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'

export default function EditConsist() {
    const location = useLocation()
    const navigate = useNavigate()

    const makeButtons = () => {

        const makeBtn = () => {
            if (location.pathname.includes('new')) {
                return <Button size="sm">Create Consist</Button>
            } else if (location.pathname.includes('edit')) {
                return <Button size="sm">Update Consist</Button>
            } else return 'ERROR'
        }

        return (
            <div style={{ textAlign: 'right' }}>
                <Button size="sm" onClick={() => navigate('/consists')}>Cancel</Button>
                <div style={{ display: 'inline-block', width: '8px' }} />
                {makeBtn()}
            </div>
        )
    }

    return (
        <div>
            <div><b>Edit Consist</b></div>
            {makeButtons()}
        </div>
    )
}
