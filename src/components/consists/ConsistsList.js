import React from 'react'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import { useNavigate } from 'react-router-dom';

export default function ConsistsList() {
    const navigate = useNavigate()
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Consists</b>
                <div
                    style={{ display: 'inline-block', color: 'green', cursor: 'pointer', marginLeft: '10px' }}
                    onClick={() => navigate('/consists/new')}
                >
                    <AddCircleTwoToneIcon />
                </div>
            </div>
        </div>
    )
}
