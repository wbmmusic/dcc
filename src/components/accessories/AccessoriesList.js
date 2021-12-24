import React from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

export default function AccessoriesList() {
    const navigate = useNavigate()
    return (
        <div>
            <h3>Accessories List</h3>
            <Button size='sm' onClick={navigate('/accessories/new')}>New Accessory</Button>
        </div>
    )
}
