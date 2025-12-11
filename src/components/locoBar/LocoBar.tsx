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
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

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
export default function LocoBar({ selectedLoco, onSelectLocomotive }: LocoBarProps) {
    const theme = useTheme()
    const navigate = useNavigate();

    const [locos, setLocos] = useState<Locomotive[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )


    useEffect(() => {
        window.electron.invoke('getLocomotives')
            .then((theLocos: unknown) => setLocos(theLocos as Locomotive[]))
            .catch((err: unknown) => console.log(err))
    }, [])



    const visibleLocos = locos.filter(loco => !loco.hidden)

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        
        if (active.id !== over?.id) {
            const oldIndex = visibleLocos.findIndex(loco => loco._id === active.id)
            const newIndex = visibleLocos.findIndex(loco => loco._id === over?.id)
            
            if (oldIndex !== -1 && newIndex !== -1) {
                // Update local state immediately for smooth animation
                const newVisibleLocos = arrayMove(visibleLocos, oldIndex, newIndex)
                const newLocos = [...locos]
                
                // Update the full array maintaining hidden locomotives
                let visibleIdx = 0
                for (let i = 0; i < newLocos.length; i++) {
                    if (!newLocos[i].hidden) {
                        newLocos[i] = newVisibleLocos[visibleIdx]
                        visibleIdx++
                    }
                }
                
                setLocos(newLocos)
                
                // Update backend in background
                window.electron.invoke('moveLocomotive', oldIndex, newIndex)
            }
        }
    }

    if (locos.length <= 0) return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}><b>No Locomotives</b></div>
            <div style={{ textAlign: 'center' }}><Button size='sm' onClick={() => navigate('/locomotives/new')}>Add Locomotive</Button></div>
        </div>
    )

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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={visibleLocos.map(loco => loco._id)} strategy={horizontalListSortingStrategy}>
                    {visibleLocos.map((loco, i) => {
                        const color = loco._id === selectedLoco ? '#3498DB' : 'lightgrey'
                        return (
                            <LocoIcon
                                key={loco._id}
                                loco={loco}
                                numberOfLocos={locos.length}
                                idx={i}
                                selectedLoco={selectedLoco}
                                setSelectedLoco={onSelectLocomotive}
                                color={color}
                            />
                        )
                    })}
                </SortableContext>
                <DragOverlay>
                    {activeId ? (
                        <div style={{ opacity: 0.8 }}>
                            {(() => {
                                const draggedLoco = visibleLocos.find(loco => loco._id === activeId)
                                if (!draggedLoco) return null
                                const color = draggedLoco._id === selectedLoco ? '#3498DB' : 'lightgrey'
                                return (
                                    <LocoIcon
                                        loco={draggedLoco}
                                        numberOfLocos={locos.length}
                                        idx={0}
                                        selectedLoco={selectedLoco}
                                        setSelectedLoco={onSelectLocomotive}
                                        color={color}
                                    />
                                )
                            })()} 
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
