/**
 * Locomotive Selection Bar Component
 * 
 * Displays a horizontal scrollable bar of locomotive icons for quick selection.
 * Provides visual status indicators and management controls for the locomotive roster.
 */

import React, { useEffect, useState } from 'react'
import { Button, useTheme } from '../../ui';
import { useNavigate } from 'react-router-dom';
import LocoIcon from './LocoIcon';

import { LocoBarProps } from '../../types/react';
import { Locomotive } from '../../types';

/**
 * Locomotive Selection Bar
 * 
 * Features:
 * - Horizontal scrollable layout for locomotive icons
 * - Color-coded selection and status indicators
 * - Show/hide toggle for hidden locomotives
 * - Empty state with quick add functionality
 * - Visual feedback for selected locomotive
 * 
 * Color Coding:
 * - Blue: Currently selected locomotive
 * - Red: Hidden locomotive (when showing all)
 * - Light gray: Available locomotive
 * 
 * @param {LocoBarProps} props - Component props
 * @returns {React.JSX.Element} The locomotive selection bar
 */
export default function LocoBar({ selectedLoco, setSelectedLoco }: LocoBarProps) {
    const theme = useTheme()
    const navigate = useNavigate();

    const [locos, setLocos] = useState<Locomotive[]>([])
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        window.electron.invoke('getLocomotives')
            .then((theLocos: unknown) => setLocos(theLocos as Locomotive[]))
            .catch((err: unknown) => console.log(err))
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
            if (locos[i]._id === selectedLoco) color = '#3498DB'
            if (locos[i].hidden) color = '#D98880'

            var tempKey = "LocoIcon" + i

            if (!locos[i].hidden || showAll) {
                locoIcons.push(
                    <div key={tempKey} data-name="LocoSlot" style={{ display: 'inline-block' }}>
                        <LocoIcon
                            loco={locos[i]}
                            numberOfLocos={locos.length}
                            idx={i}
                            selectedLoco={selectedLoco}
                            setSelectedLoco={setSelectedLoco}
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
                <div key="Show/HideButton" data-name="showHideBtn" style={{ display: 'inline-block' }}>
                    <div style={{
                        backgroundColor: theme.colors.light,
                        height: '118px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        fontSize: theme.fontSize.sm,
                        padding: `0 ${theme.spacing.sm}`,
                        cursor: 'context-menu',
                        borderRadius: theme.borderRadius.md,
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
                backgroundColor: theme.colors.background.light,
                maxWidth: '100%',
                width: '100%',
                height: '140px',
                minHeight: '140px',
                display: 'flex',
                overflow: 'hidden',
                overflowX: 'auto',
                borderBottom: `2px solid ${theme.colors.safetyStripe}`,
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                padding: `${theme.spacing.xs} 0`
            }}
        >
            {makeLocoIcons()}
        </div>
    )
}
