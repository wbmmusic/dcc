/**
 * DCC Service - Hardware Communication
 * 
 * Pure DCC protocol handling without UI concerns.
 * Manages NCE USB interface and command processing.
 */

import { EventEmitter } from 'events'
import { NceUSB } from '../interfaces/nceUsb.js'
import type { StateService } from './StateService.js'

export interface DCCCommand {
    type: 'locoCtrlCmd' | 'asyncSignal' | 'opsProgramming' | 'enableProgrammingTrack' | 'disableProgrammingTrack' | 'readCvPrg'
    data?: any
    callback?: (result: any) => void
}

export class DCCService extends EventEmitter {
    private nceInterface: NceUSB | null = null
    private stateService: StateService

    constructor(stateService: StateService) {
        super()
        this.stateService = stateService
    }

    /**
     * Initialize DCC interface
     */
    async initialize(settings: { usbInterface: { port: string; type: string } }): Promise<void> {
        if (!settings.usbInterface.port) {
            throw new Error('No USB port configured')
        }

        try {
            this.nceInterface = new NceUSB({
                comPort: settings.usbInterface.port,
                status: (connected: boolean) => {
                    this.stateService.setConnection(connected, settings.usbInterface.port)
                    this.emit('connectionChanged', connected)
                }
            })
        } catch (error) {
            this.emit('error', error)
            throw error
        }
    }

    /**
     * Send locomotive control command
     */
    async setLocomotiveSpeed(address: number, speed: number, direction: 'forward' | 'reverse'): Promise<void> {
        if (!this.nceInterface) throw new Error('DCC interface not initialized')

        const command: DCCCommand = {
            type: 'locoCtrlCmd',
            data: this.buildSpeedCommand(address, speed, direction)
        }

        this.nceInterface.sendMSG(command)
    }

    /**
     * Set locomotive function
     */
    async setLocomotiveFunction(address: number, functionNum: number, functions: any[]): Promise<void> {
        if (!this.nceInterface) throw new Error('DCC interface not initialized')

        const command: DCCCommand = {
            type: 'locoCtrlCmd',
            data: this.buildFunctionCommand(address, functionNum, functions)
        }

        this.nceInterface.sendMSG(command)
    }

    /**
     * Send emergency stop
     */
    async emergencyStop(address: number, direction: 'forward' | 'reverse'): Promise<void> {
        return this.setLocomotiveSpeed(address, 0, direction)
    }

    /**
     * Control switch/accessory
     */
    async setSwitch(address: number, state: boolean): Promise<void> {
        if (!this.nceInterface) throw new Error('DCC interface not initialized')

        const command: DCCCommand = {
            type: 'asyncSignal',
            data: this.buildSwitchCommand(address, state)
        }

        this.nceInterface.sendMSG(command)
    }

    /**
     * Enable programming track
     */
    async enableProgrammingTrack(): Promise<boolean> {
        if (!this.nceInterface) throw new Error('DCC interface not initialized')

        return new Promise((resolve, reject) => {
            const command: DCCCommand = {
                type: 'enableProgrammingTrack',
                callback: (result: boolean) => {
                    this.stateService.setProgrammingTrack(result)
                    resolve(result)
                }
            }
            this.nceInterface!.sendMSG(command)
        })
    }

    /**
     * Disable programming track
     */
    async disableProgrammingTrack(): Promise<boolean> {
        if (!this.nceInterface) throw new Error('DCC interface not initialized')

        return new Promise((resolve, reject) => {
            const command: DCCCommand = {
                type: 'disableProgrammingTrack',
                callback: (result: boolean) => {
                    this.stateService.setProgrammingTrack(!result)
                    resolve(!result)
                }
            }
            this.nceInterface!.sendMSG(command)
        })
    }

    /**
     * Read CV from programming track
     */
    async readCV(cv: number): Promise<number> {
        if (!this.nceInterface) throw new Error('DCC interface not initialized')

        return new Promise((resolve, reject) => {
            const command: DCCCommand = {
                type: 'readCvPrg',
                data: this.buildCVCommand(cv),
                callback: (result: number) => resolve(result)
            }
            this.nceInterface!.sendMSG(command)
        })
    }

    /**
     * Get connection status
     */
    isConnected(): boolean {
        return this.stateService.getState().connection.connected
    }

    /**
     * Close DCC interface
     */
    close(): void {
        if (this.nceInterface) {
            this.nceInterface.closeSerialPort()
            this.nceInterface = null
        }
    }

    // Private helper methods for building DCC commands
    private buildSpeedCommand(address: number, speed: number, direction: string): number[] {
        // DCC speed command format - simplified
        const dirBit = direction === 'forward' ? 0x80 : 0x00
        return [address, dirBit | speed]
    }

    private buildFunctionCommand(address: number, functionNum: number, functions: any[]): number[] {
        // DCC function command format - simplified
        let functionByte = 0
        if (functionNum >= 0 && functionNum <= 4) {
            // F0-F4 group
            if (functions[0]?.state) functionByte |= 0x10 // F0
            if (functions[1]?.state) functionByte |= 0x01 // F1
            if (functions[2]?.state) functionByte |= 0x02 // F2
            if (functions[3]?.state) functionByte |= 0x04 // F3
            if (functions[4]?.state) functionByte |= 0x08 // F4
            return [address, 0x80 | functionByte]
        }
        return [address, 0x80]
    }

    private buildSwitchCommand(address: number, state: boolean): number[] {
        // DCC accessory command format
        const cmd = state ? 0x01 : 0x00
        return [address, cmd]
    }

    private buildCVCommand(cv: number): number[] {
        // CV read command format
        const cvHigh = Math.floor(cv / 256)
        const cvLow = cv % 256
        return [cvHigh, cvLow]
    }
}