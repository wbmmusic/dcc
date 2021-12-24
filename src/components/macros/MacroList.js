import React from 'react'
import { useNavigate } from 'react-router-dom'
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';

export default function MacroList() {
    const navigate = useNavigate()

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <b>Macro List</b>
                <div style={{ color: 'green', display: 'inline-block', marginLeft: '10px', cursor: 'pointer' }}
                    onClick={() => navigate('/macros/new')}
                >
                    <AddCircleTwoToneIcon />
                </div>
            </div>
        </div>
    )
}
