/**
 * Switch Control Module
 * 
 * Manages DCC turnout/switch control for model railroad track switches.
 * Handles both normal and reverse-wired switches with proper DCC commands.
 */

import { sendAsyncSignal } from './messenger.js';

/**
 * Send DCC switch command with proper polarity handling
 * 
 * DCC switches use accessory commands with specific operation codes:
 * - Op 3: Throw switch to diverging route
 * - Op 4: Throw switch to straight route
 * 
 * @param {number} address - DCC accessory address of the switch
 * @param {boolean} data - Switch state (true = open/diverging, false = closed/straight)
 * @param {boolean} reverse - Whether switch wiring is reversed
 */
const sendData = (address: number, data: boolean, reverse: boolean) => {
    if (reverse) {
        if (data) sendAsyncSignal(address, 4, 0)
        else sendAsyncSignal(address, 3, 0)
    } else {
        if (data) sendAsyncSignal(address, 3, 0)
        else sendAsyncSignal(address, 4, 0)
    }

}

/**
 * Switch Control Class
 * 
 * Represents a single DCC-controlled turnout/switch on the layout.
 * Provides methods for throwing switches to different positions and
 * maintains current switch state.
 */
export class Switch {
    state: boolean;
    address!: number;
    reverse!: boolean;
    _id!: string;
    name!: string;

    /**
     * Initialize switch with configuration data
     * @param {any} switchConfig - Switch configuration object
     */
    constructor(switchConfig: any) {
        if (switchConfig) { Object.assign(this, { ...switchConfig }) }
        this.state = false  // Default to closed/straight position
    }
    
    /**
     * Throw switch to open/diverging position
     * @returns {boolean} New switch state (true)
     */
    open = () => {
        this.state = true
        sendData(this.address, this.state, this.reverse)
        return this.state
    }
    
    /**
     * Throw switch to closed/straight position
     * @returns {boolean} New switch state (false)
     */
    close = () => {
        this.state = false
        sendData(this.address, this.state, this.reverse)
        return this.state
    }
    
    /**
     * Toggle switch between open and closed positions
     * @returns {boolean} New switch state
     */
    toggle = () => {
        console.log("Toggle Switch", this)
        this.state = !this.state
        sendData(this.address, this.state, this.reverse)
        return this.state
    }
}

