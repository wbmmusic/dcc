/**
 * Accessory Control Module
 * 
 * Manages DCC accessory devices like signals, lights, and animated scenery.
 * Provides function-based control similar to locomotive decoders but for
 * stationary layout elements.
 */

import { setFunction } from './messenger.js';

/**
 * Creates a standardized function state array for accessory decoders
 * 
 * DCC accessories can have up to 29 function outputs (F0-F28) for controlling
 * various features like lights, motors, and sound effects.
 * 
 * @param {any[]} actions - Array of configured function definitions
 * @returns {Array} Normalized array of 29 function states
 */
const makeFunctionStates = (actions: any[]) => {
    let out = []
    for (let i = 0; i < 29; i++) {
        if (i < actions.length) out.push(actions[i])
        else out.push({ name: '', state: false })
    }
    return out
}

/**
 * Accessory Control Class
 * 
 * Represents a DCC accessory decoder with function-based control.
 * Used for stationary layout elements that need multi-function control
 * beyond simple on/off switch operation.
 */
export class Accessory {
    _id!: string;
    device!: any;

    /**
     * Initialize accessory with configuration data
     * @param {any} acc - Accessory configuration object
     */
    constructor(acc: any) {
        if (acc) { Object.assign(this, { ...acc }) }
    }
    
    /** Get current accessory information */
    info = () => { return { ...this } }
    
    /**
     * Toggle a specific function on the accessory decoder
     * 
     * @param {number} address - DCC address of the accessory
     * @param {number} functionNumber - Function number to toggle (0-28)
     * @returns {boolean} New state of the function
     */
    toggleFunction = (address: number, functionNumber: number) => {
        this.device.actions[functionNumber].state = !this.device.actions[functionNumber].state
        setFunction(address, functionNumber, makeFunctionStates(this.device.actions))
        return this.device.actions[functionNumber].state
    }
}

