import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import LocoIcon from './LocoIcon';

export default function LocoBar({ selectedLoco, selectLoco }) {
    const navigate = useNavigate();

    const [locos, setLocos] = useState([])
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        window.electron.invoke('getLocomotives')
            .then(theLocos => setLocos(theLocos))
            .catch(err => console.log(err))
    }, [])

    const handleToggleHidden = () => {
        console.log('Toggle Hidden Locos')
        if (showAll) setShowAll(false)
        else setShowAll(true)
    }

    const makeLocoIcons = () => {
        let locoIcons = []

        if (locos.length <= 0) return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}><b>No Locomotives</b></div>
                <div style={{ textAlign: 'center' }}><Button size='sm' onClick={() => navigate('/locomotives/new')}>Add Locomotive</Button></div>
            </div>
        )

        for (var i = 0; i < locos.length; i++) {
            var color = 'lightgrey'
            if (i === selectedLoco) color = '#3498DB'
            if (locos[i].hidden) color = '#D98880'

            var tempKey = "LocoIcon" + i

            if (!locos[i].hidden || showAll) {
                locoIcons.push(
                    <div key={tempKey} name="LocoSlot" style={{ display: 'inline-block' }}>
                        <LocoIcon
                            loco={locos[i]}
                            numberOfLocos={locos.length - 1}
                            index={i}
                            selectedLoco={selectedLoco}
                            selected={selectLoco}
                            color={color}
                        />
                    </div>
                )
            }
        }

        let btnLbl

        if (showAll) btnLbl = "Hide Locos"
        else btnLbl = "Show All Locos"

        var isOneHidden = false
        for (var locoCnt = 0; locoCnt < locos.length; locoCnt++) {
            if (locos[locoCnt].hidden) {
                isOneHidden = true
                break
            }
        }

        if (isOneHidden) {
            locoIcons.push(
                <div key="Show/HideButton" name="showHideBtn" style={{ display: 'inline-block' }}>
                    <div style={{
                        backgroundColor: 'white',
                        height: '118px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        fontSize: '12px',
                        padding: '0px 10px',
                        cursor: 'context-menu',
                        borderRadius: '5px',
                    }}
                        onMouseDown={handleToggleHidden}
                    >
                        <div>{btnLbl}</div>
                    </div>
                </div>
            )
        }

        return locoIcons
    }

    return (
        <div
            style={{
                //backgroundColor: '#7B7D7D',
                maxWidth: '100%',
                width: '100%',
                height: '140px',
                minHeight: '140px',
                display: 'flex',
                overflow: 'hidden',
                overflowX: 'auto',
                borderBottom: '1px solid darkGray',
                alignItems: 'center',
            }}
        >
            {makeLocoIcons()}
        </div>
    )
}
