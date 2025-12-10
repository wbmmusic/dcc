/**
 * State Service - Centralized State Management
 * 
 * Single source of truth for all application state.
 * Provides immutable updates and change notifications.
 */

import { EventEmitter } from 'events'
import type { Locomotive, Switch, Accessory, LocoState } from '../../src/shared/types.js'

export interface AppState {
    locomotives: Record<string, LocoState>
    switches: Record<string, { _id: string; name: string; state: boolean }>
    accessories: Record<string, any>
    connection: {
        connected: boolean
        port: string
        programmingTrack: boolean
    }
}

export class StateService extends EventEmitter {
    private state: AppState = {
        locomotives: {},
        switches: {},
        accessories: {},
        connection: {
            connected: false,
            port: '',
            programmingTrack: false
        }
    }

    /**
     * Get current state (immutable)
     */
    getState(): Readonly<AppState> {
        return { ...this.state }
    }

    /**
     * Get locomotive state
     */
    getLocomotive(id: string): LocoState | null {
        return this.state.locomotives[id] || null
    }

    /**
     * Update locomotive state
     */
    updateLocomotive(id: string, updates: Partial<LocoState>): void {
        const current = this.state.locomotives[id]
        if (current) {
            this.state.locomotives[id] = { ...current, ...updates }
            this.emit('locomotiveChanged', id, this.state.locomotives[id])
            this.emit('stateChanged', this.state)
        }
    }

    /**
     * Set locomotive state
     */
    setLocomotive(id: string, state: LocoState): void {
        this.state.locomotives[id] = { ...state }
        this.emit('locomotiveChanged', id, state)
        this.emit('stateChanged', this.state)
    }

    /**
     * Update switch state
     */
    updateSwitch(id: string, state: boolean): void {
        if (this.state.switches[id]) {
            this.state.switches[id].state = state
            this.emit('switchChanged', id, state)
            this.emit('stateChanged', this.state)
        }
    }

    /**
     * Set connection state
     */
    setConnection(connected: boolean, port?: string): void {
        this.state.connection.connected = connected
        if (port) this.state.connection.port = port
        this.emit('connectionChanged', this.state.connection)
        this.emit('stateChanged', this.state)
    }

    /**
     * Set programming track state
     */
    setProgrammingTrack(enabled: boolean): void {
        this.state.connection.programmingTrack = enabled
        this.emit('programmingTrackChanged', enabled)
        this.emit('stateChanged', this.state)
    }

    /**
     * Initialize state from config
     */
    initializeFromConfig(config: any): void {
        // Initialize switches
        config.switches?.forEach((sw: any) => {
            this.state.switches[sw._id] = {
                _id: sw._id,
                name: sw.name,
                state: sw.state || false
            }
        })

        this.emit('stateChanged', this.state)
    }
}