/**
 * Locomotive Controller
 * 
 * Handles locomotive-specific business logic.
 * Coordinates between DCC commands and state management.
 */

import type { DCCService } from '../services/DCCService.js'
import type { StateService } from '../services/StateService.js'
import type { WindowService } from '../services/WindowService.js'
import { config } from '../utilities.js'

export class LocomotiveController {
    private dccService: DCCService
    private stateService: StateService
    private windowService: WindowService

    constructor(
        dccService: DCCService,
        stateService: StateService,
        windowService: WindowService
    ) {
        this.dccService = dccService
        this.stateService = stateService
        this.windowService = windowService
        this.setupEventListeners()
    }

    /**
     * Handle throttle commands from UI
     */
    async handleThrottleCommand(locomotiveId: string, action: string, data?: any): Promise<any> {
        const locomotive = this.getLocomotiveConfig(locomotiveId)
        if (!locomotive) {
            throw new Error(`Locomotive ${locomotiveId} not found`)
        }

        const currentState = this.stateService.getLocomotive(locomotiveId)
        if (!currentState) {
            // Initialize locomotive state
            this.initializeLocomotiveState(locomotiveId, locomotive)
        }

        switch (action) {
            case 'getThrottle':
                return this.getThrottleData(locomotiveId, locomotive)

            case 'setSpeed':
                return this.setSpeed(locomotiveId, locomotive, data)

            case 'setDirection':
                return this.setDirection(locomotiveId, locomotive, data)

            case 'setFunction':
                return this.setFunction(locomotiveId, locomotive, data)

            case 'eStop':
                return this.emergencyStop(locomotiveId, locomotive)

            case 'eStopAll':
                return this.emergencyStopAll()

            default:
                throw new Error(`Unknown throttle action: ${action}`)
        }
    }

    /**
     * Show throttle window for locomotive
     */
    async showThrottle(locomotiveId: string): Promise<void> {
        const locomotive = this.getLocomotiveConfig(locomotiveId)
        if (!locomotive) {
            throw new Error(`Locomotive ${locomotiveId} not found`)
        }

        // Initialize state if needed
        if (!this.stateService.getLocomotive(locomotiveId)) {
            this.initializeLocomotiveState(locomotiveId, locomotive)
        }

        await this.windowService.createThrottleWindow(locomotiveId, locomotive)
    }

    /**
     * Close throttle window
     */
    closeThrottle(locomotiveId: string): void {
        this.windowService.closeThrottleWindow(locomotiveId)
    }

    /**
     * Close all throttle windows
     */
    closeAllThrottles(): void {
        this.windowService.closeAllThrottles()
    }

    // Private methods

    private getLocomotiveConfig(locomotiveId: string): any {
        return config.locos.find((loco: any) => loco._id === locomotiveId)
    }

    private initializeLocomotiveState(locomotiveId: string, locomotive: any): void {
        const decoder = config.decoders.find((d: any) => d._id === locomotive.decoder)
        const functions = decoder ? this.makeFunctionState(decoder) : []

        const initialState = {
            name: locomotive.name,
            number: locomotive.number,
            photo: locomotive.photo,
            direction: 'forward' as const,
            speed: 0,
            functions
        }

        this.stateService.setLocomotive(locomotiveId, initialState)
    }

    private makeFunctionState(decoder: any): any[] {
        const functions = []
        for (let i = 0; i < 29; i++) {
            functions.push({
                name: decoder.functions[i]?.name || '',
                action: decoder.functions[i]?.action || 'toggle',
                state: false
            })
        }
        return functions
    }

    private getThrottleData(locomotiveId: string, locomotive: any): any {
        const state = this.stateService.getLocomotive(locomotiveId)
        const decoder = config.decoders.find((d: any) => d._id === locomotive.decoder)
        
        return {
            ...state,
            ...locomotive,
            dcdr: decoder
        }
    }

    private async setSpeed(locomotiveId: string, locomotive: any, speed: number): Promise<number> {
        const currentState = this.stateService.getLocomotive(locomotiveId)!
        
        // Send DCC command
        await this.dccService.setLocomotiveSpeed(locomotive.address, speed, currentState.direction)
        
        // Update state
        this.stateService.updateLocomotive(locomotiveId, { speed })
        
        return speed
    }

    private async setDirection(locomotiveId: string, locomotive: any, direction: 'forward' | 'reverse'): Promise<string> {
        const currentState = this.stateService.getLocomotive(locomotiveId)!
        
        // Send DCC command
        await this.dccService.setLocomotiveSpeed(locomotive.address, currentState.speed, direction)
        
        // Update state
        this.stateService.updateLocomotive(locomotiveId, { direction })
        
        return direction
    }

    private async setFunction(locomotiveId: string, locomotive: any, functionIndex: number): Promise<any[]> {
        const currentState = this.stateService.getLocomotive(locomotiveId)!
        const functions = [...currentState.functions]
        
        // Toggle function state
        functions[functionIndex].state = !functions[functionIndex].state
        
        // Send DCC command
        await this.dccService.setLocomotiveFunction(locomotive.address, functionIndex, functions)
        
        // Update state
        this.stateService.updateLocomotive(locomotiveId, { functions })
        
        return functions
    }

    private async emergencyStop(locomotiveId: string, locomotive: any): Promise<number> {
        const currentState = this.stateService.getLocomotive(locomotiveId)!
        
        // Send DCC emergency stop
        await this.dccService.emergencyStop(locomotive.address, currentState.direction)
        
        // Update state
        this.stateService.updateLocomotive(locomotiveId, { speed: 0 })
        
        return 0
    }

    private async emergencyStopAll(): Promise<string> {
        // Stop all active locomotives
        const state = this.stateService.getState()
        const stopPromises = Object.keys(state.locomotives).map(async (locomotiveId) => {
            const locomotive = this.getLocomotiveConfig(locomotiveId)
            if (locomotive) {
                await this.emergencyStop(locomotiveId, locomotive)
            }
        })
        
        await Promise.all(stopPromises)
        return "Emergency stop all completed"
    }

    private setupEventListeners(): void {
        // Listen for throttle commands from windows
        this.stateService.on('throttleCommand', async (event: any) => {
            try {
                const result = await this.handleThrottleCommand(
                    event.locomotiveId,
                    event.action,
                    event.data
                )
                event.callback(result)
            } catch (error) {
                console.error('Throttle command error:', error)
                event.callback({ error: error.message })
            }
        })
    }
}