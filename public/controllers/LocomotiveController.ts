/**
 * Locomotive Controller - Business Logic Coordinator
 * 
 * Orchestrates locomotive operations by coordinating between multiple services:
 * - DCCService: Hardware communication (speed, direction, functions)
 * - StateService: Application state management and persistence
 * - WindowService: Throttle window lifecycle management
 * 
 * Design Patterns:
 * - Command Pattern: Each throttle action is a discrete command
 * - Observer Pattern: Listens for state changes and UI events
 * - Factory Pattern: Creates standardized locomotive state objects
 * 
 * Responsibilities:
 * - Locomotive state initialization and management
 * - DCC command translation and execution
 * - Throttle window creation and coordination
 * - Emergency stop operations (individual and global)
 * - Function decoder state management (F0-F28)
 */

import type { DCCService } from '../services/DCCService.js'
import type { StateService } from '../services/StateService.js'
import type { WindowService } from '../services/WindowService.js'
import type { Locomotive, Decoder, LocoFunction } from '../../src/shared/types.js'
import { config } from '../utilities.js'
import { logger } from '../Logger.js'

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
     * Central command dispatcher for all locomotive throttle operations
     */
    async handleThrottleCommand(locomotiveId: string, action: string, data?: any): Promise<any> {
        this.validateThrottleCommand(locomotiveId, action)
        
        const locomotive = this.getLocomotiveConfig(locomotiveId)
        if (!locomotive) {
            throw new Error(`Locomotive ${locomotiveId} not found`)
        }

        this.ensureLocomotiveState(locomotiveId, locomotive)
        
        // Enhanced logging for function commands
        if ((action === 'setFunction' || action === 'releaseFunction') && typeof data === 'number') {
            const decoder = config.decoders.find((d: Decoder) => d._id === locomotive.decoder)
            const functionName = decoder?.functions[data]?.name || `F${data}`
            if (action === 'setFunction') {
                const currentState = this.stateService.getLocomotive(locomotiveId)
                const newState = currentState?.functions[data]?.state ? 'OFF' : 'ON'
                logger.throttle(locomotiveId, action, `F${data}: ${functionName}: ${newState}`)
            } else {
                logger.throttle(locomotiveId, action, `F${data}: ${functionName}: OFF`)
            }
        } else {
            logger.throttle(locomotiveId, action, data)
        }

        return this.executeThrottleAction(locomotiveId, locomotive, action, data)
    }

    private validateThrottleCommand(locomotiveId: string, action: string): void {
        if (!locomotiveId || typeof locomotiveId !== 'string') {
            throw new Error('Invalid locomotive ID')
        }
        if (!action || typeof action !== 'string') {
            throw new Error('Invalid action')
        }
    }

    private ensureLocomotiveState(locomotiveId: string, locomotive: Locomotive): void {
        const currentState = this.stateService.getLocomotive(locomotiveId)
        if (!currentState) {
            this.initializeLocomotiveState(locomotiveId, locomotive)
        }
    }

    private async executeThrottleAction(locomotiveId: string, locomotive: Locomotive, action: string, data?: any): Promise<any> {
        switch (action) {
            case 'getThrottle':
                return this.getThrottleData(locomotiveId, locomotive)
            case 'setSpeed':
                return this.setSpeed(locomotiveId, locomotive, data)
            case 'setDirection':
                return this.setDirection(locomotiveId, locomotive, data)
            case 'setFunction':
                return this.setFunction(locomotiveId, locomotive, data)
            case 'releaseFunction':
                return this.releaseFunction(locomotiveId, locomotive, data)
            case 'eStop':
                return this.emergencyStop(locomotiveId, locomotive)
            case 'eStopAll':
                return this.emergencyStopAll()
            default:
                throw new Error(`Unknown throttle action: ${action}`)
        }
    }

    /**
     * Create and display always-on-top throttle window for locomotive
     * 
     * Throttle windows provide dedicated control interfaces for individual locomotives,
     * allowing simultaneous operation of multiple trains. Each window maintains its own
     * state synchronization with the main application.
     * 
     * Features:
     * - Always-on-top for easy access during operations
     * - Real-time state synchronization with main window
     * - Independent speed and function control
     * - Automatic state initialization if needed
     * 
     * @param locomotiveId - ID of locomotive to create throttle for
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

    private getLocomotiveConfig(locomotiveId: string): Locomotive | undefined {
        return config.locos.find((loco: Locomotive) => loco._id === locomotiveId)
    }

    /**
     * Initialize locomotive runtime state from configuration data
     * 
     * Creates a standardized state object combining locomotive configuration
     * with decoder function definitions. All locomotives start in a safe state:
     * - Speed: 0 (stopped)
     * - Direction: Forward
     * - Functions: All off (false)
     * 
     * The function array is built from the associated decoder definition,
     * providing up to 29 functions (F0-F28) with proper names and actions.
     * 
     * @param locomotiveId - Unique locomotive identifier
     * @param locomotive - Locomotive configuration object
     */
    private initializeLocomotiveState(locomotiveId: string, locomotive: Locomotive): void {
        const decoder = config.decoders.find((d: Decoder) => d._id === locomotive.decoder)
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

    /**
     * Create standardized function state array from decoder definition
     * 
     * DCC decoders support up to 29 functions (F0-F28) for controlling various
     * locomotive features like lights, sounds, smoke, and other effects.
     * Each function has:
     * - name: User-friendly description ("Headlight", "Horn", etc.)
     * - action: Behavior type ("toggle", "momentary")
     * - state: Current on/off status (always starts false)
     * 
     * @param decoder - Decoder configuration with function definitions
     * @returns Array of 29 function state objects
     */
    private makeFunctionState(decoder: Decoder): LocoFunction[] {
        const functions = []
        for (let i = 0; i < 29; i++) {
            functions.push({
                name: decoder.functions[i]?.name || '',
                state: false,
                action: decoder.functions[i]?.action || 'toggle'
            })
        }
        return functions
    }

    private getThrottleData(locomotiveId: string, locomotive: Locomotive): any {
        const state = this.stateService.getLocomotive(locomotiveId)
        const decoder = config.decoders.find((d: Decoder) => d._id === locomotive.decoder)
        
        return {
            ...state,
            ...locomotive,
            decoder: decoder
        }
    }

    /**
     * Set locomotive speed with DCC command and state update
     * 
     * DCC speed control uses 126 speed steps (0=stop, 1=emergency stop, 2-127=speed).
     * The direction is maintained from current state to provide smooth operation.
     * 
     * Process:
     * 1. Send DCC speed command to hardware
     * 2. Update application state
     * 3. Trigger UI updates via state service events
     * 
     * @param locomotiveId - Target locomotive ID
     * @param locomotive - Locomotive configuration (contains DCC address)
     * @param speed - New speed value (0-126)
     * @returns Promise resolving to the set speed value
     */
    private async setSpeed(locomotiveId: string, locomotive: Locomotive, speed: number): Promise<number> {
        const currentState = this.stateService.getLocomotive(locomotiveId)!
        
        try {
            // Send DCC command
            await this.dccService.setLocomotiveSpeed(locomotive.address, speed, currentState.direction)
            
            // Update state
            this.stateService.updateLocomotive(locomotiveId, { speed })
            
            return speed
        } catch (error) {
            logger.error(`Failed to set speed for locomotive ${locomotiveId}`, error)
            throw error
        }
    }

    private async setDirection(locomotiveId: string, locomotive: Locomotive, direction: 'forward' | 'reverse'): Promise<string> {
        const currentState = this.stateService.getLocomotive(locomotiveId)!
        
        try {
            // Send DCC command
            await this.dccService.setLocomotiveSpeed(locomotive.address, currentState.speed, direction)
            
            // Update state
            this.stateService.updateLocomotive(locomotiveId, { direction })
            
            return direction
        } catch (error) {
            logger.error(`Failed to set direction for locomotive ${locomotiveId}`, error)
            throw error
        }
    }

    /**
     * Toggle locomotive decoder function (lights, sounds, etc.)
     * 
     * DCC functions are organized in groups for efficient transmission:
     * - F0-F4: Primary functions (headlight, bell, horn, etc.)
     * - F5-F8: Secondary functions
     * - F9-F12: Extended functions
     * - F13-F20: Advanced functions
     * - F21-F28: Extended advanced functions
     * 
     * The function state is toggled and the entire function group is sent
     * to ensure decoder synchronization.
     * 
     * @param locomotiveId - Target locomotive ID
     * @param locomotive - Locomotive configuration
     * @param functionIndex - Function number to toggle (0-28)
     * @returns Promise resolving to updated function array
     */
    private async setFunction(locomotiveId: string, locomotive: Locomotive, functionIndex: number): Promise<LocoFunction[]> {
        const currentState = this.stateService.getLocomotive(locomotiveId)!
        const functions = [...currentState.functions]
        const decoder = config.decoders.find((d: Decoder) => d._id === locomotive.decoder)
        
        try {
            // Handle toggle vs momentary functions differently
            if (decoder?.functions[functionIndex]?.action === 'toggle') {
                // Toggle functions: flip state on each press
                functions[functionIndex].state = !functions[functionIndex].state
            } else {
                // Momentary functions: always turn on (will be turned off by onMouseUp)
                functions[functionIndex].state = true
            }
            
            // Send DCC command
            await this.dccService.setLocomotiveFunction(locomotive.address, functionIndex, functions)
            
            // Update state
            this.stateService.updateLocomotive(locomotiveId, { functions })
            
            return functions
        } catch (error) {
            logger.error(`Failed to set function ${functionIndex} for locomotive ${locomotiveId}`, error)
            throw error
        }
    }

    /**
     * Release momentary function (turn it off)
     */
    private async releaseFunction(locomotiveId: string, locomotive: Locomotive, functionIndex: number): Promise<LocoFunction[]> {
        const currentState = this.stateService.getLocomotive(locomotiveId)!
        const functions = [...currentState.functions]
        const decoder = config.decoders.find((d: Decoder) => d._id === locomotive.decoder)
        
        try {
            // Only release momentary functions
            if (decoder?.functions[functionIndex]?.action === 'momentary') {
                functions[functionIndex].state = false
                
                // Send DCC command
                await this.dccService.setLocomotiveFunction(locomotive.address, functionIndex, functions)
                
                // Update state
                this.stateService.updateLocomotive(locomotiveId, { functions })
            }
            
            return functions
        } catch (error) {
            logger.error(`Failed to release function ${functionIndex} for locomotive ${locomotiveId}`, error)
            throw error
        }
    }

    private async emergencyStop(locomotiveId: string, locomotive: Locomotive): Promise<number> {
        const currentState = this.stateService.getLocomotive(locomotiveId)!
        
        try {
            // Send DCC emergency stop
            await this.dccService.emergencyStop(locomotive.address, currentState.direction)
            
            // Update state
            this.stateService.updateLocomotive(locomotiveId, { speed: 0 })
            
            return 0
        } catch (error) {
            logger.error(`Failed to emergency stop locomotive ${locomotiveId}`, error)
            throw error
        }
    }

    /**
     * Execute emergency stop for all active locomotives
     * 
     * Iterates through all locomotives with active state and sends emergency
     * stop commands. This is a safety feature for quickly stopping all trains
     * in case of emergencies or layout issues.
     * 
     * Uses Promise.all for concurrent execution to minimize stop time.
     * 
     * @returns Promise resolving when all locomotives are stopped
     */
    private async emergencyStopAll(): Promise<string> {
        try {
            // Stop all active locomotives
            const state = this.stateService.getState()
            const stopPromises = Object.keys(state.locomotives).map(async (locomotiveId) => {
                const locomotive = this.getLocomotiveConfig(locomotiveId)
                if (locomotive) {
                    try {
                        await this.emergencyStop(locomotiveId, locomotive)
                    } catch (error) {
                        console.error(`Failed to stop locomotive ${locomotiveId} during emergency stop all:`, error)
                    }
                }
            })
            
            await Promise.all(stopPromises)
            return "Emergency stop all completed"
        } catch (error) {
            logger.error('Failed to execute emergency stop all', error)
            throw error
        }
    }

    /**
     * Configure event listeners for inter-service communication
     * 
     * Implements the Observer pattern to handle throttle commands from
     * various sources (main window, throttle windows, etc.). This decouples
     * the UI components from the business logic while maintaining real-time
     * responsiveness.
     * 
     * Events handled:
     * - throttleCommand: Commands from UI components
     * - Error handling and callback management
     */
    private setupEventListeners(): void {
        // Listen for throttle commands from windows
        this.stateService.on('throttleCommand', async (event: { locomotiveId: string; action: string; data?: any; callback: (result: any) => void }) => {
            try {
                const result = await this.handleThrottleCommand(
                    event.locomotiveId,
                    event.action,
                    event.data
                )
                event.callback(result)
            } catch (error) {
                logger.error('Throttle command error', error)
                event.callback({ error: (error as Error).message })
            }
        })
    }
}