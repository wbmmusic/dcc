/**
 * DCC Command Messenger
 * 
 * Handles all DCC (Digital Command Control) communication between the application
 * and the physical railroad hardware. Provides high-level functions for locomotive
 * control, accessory operation, and programming track operations.
 */

import { NceUSB } from './interfaces/nceUsb.js';
import * as util from './utilities.js';

// Global DCC interface instance
export let dccInterface: any = null;

/**
 * Initializes the DCC hardware interface
 * 
 * @param {any} iface - Interface configuration object
 * @param {any} status - Status callback function
 * @returns {boolean} True if interface started successfully
 */
export const startInterface = (iface: any, status: any) => {
    switch (iface.type) {
        case 'nceUsb':
            // Initialize NCE PowerCab USB interface
            dccInterface = new NceUSB({ comPort: iface.port, status: status })
            return true

        default:
            return false
    }
}

/**
 * Converts a DCC address to the required byte format
 * 
 * DCC addresses are sent as two bytes (high and low). For locomotive commands,
 * the high byte is OR'd with 0xC0 to indicate long address format.
 * 
 * @param {number} address - DCC address (1-10293)
 * @param {boolean} useC0 - Whether to set the C0 bit for locomotive addressing
 * @returns {number[]} Array of [highByte, lowByte]
 */
const getAddressBytes = (address, useC0) => {
    var lowByte = address & 0xff        // Extract low 8 bits
    var highByte = (address >> 8) & 0xff // Extract high 8 bits
    if (useC0) return [highByte | 0xC0, lowByte]  // Set C0 bit for loco addressing
    return [highByte, lowByte]
}

/**
 * Sends speed and direction command to a locomotive
 * 
 * @param {number} address - DCC address of the locomotive
 * @param {number} speed - Speed step (0-126)
 * @param {string} direction - 'forward' or 'reverse'
 */
export const setSpeedAndDir = (address: number, speed: number, direction: string) => {
    console.log(`Address: ${address} | Speed: ${speed} | Direction: ${direction}`)
    if (!util.usbConnected) return

    const makeDirection = (direction, speed) => {
        let out = [direction, speed]
        if (direction === 'forward') out[0] = 4
        else if (direction === 'reverse') out[0] = 3
        else out = [4, 0]

        return out
    }

    dccInterface.sendMSG({
        type: 'locoCtrlCmd',
        data: [...getAddressBytes(address, true), ...makeDirection(direction, speed)]
    })
}

export const sendEStop = (address: number, direction: string) => {
    if (!util.usbConnected) return
    const makeDirection = () => {
        if (direction === "forward") return 5
        else if (direction === 'reverse') return 6
        else throw new Error("E Stop Error")
    }

    dccInterface.sendMSG({
        type: 'locoCtrlCmd',
        data: [...getAddressBytes(address, true), makeDirection(), 0]
    })
}

export const setFunction = (address: number, funcNum: number, functionStates: any[]) => {
    const makeOP = () => {
        let op = 0
        if (funcNum >= 0 && funcNum <= 4) {
            op = 7
            let dataByte = 0
            const currentStates = functionStates.slice(0, 5)
            //console.log("0 - 4", currentStates)

            if (currentStates[0].state) dataByte = 1
            for (let i = 4; i >= 1; i--) {
                if (currentStates[i].state) dataByte = (dataByte << 1) | 1
                else dataByte = (dataByte << 1)
            }
            //console.log(dataByte.toString(2))
            return [op, dataByte]

        } else if (funcNum >= 5 && funcNum <= 8) {
            op = 8
            let dataByte = 0
            const currentStates = functionStates.slice(5, 9)
            //console.log("5 - 8", currentStates)
            let shift = 0
            for (let i = 3; i >= 0; i--) {
                if (currentStates[i].state) dataByte = dataByte | (1 << shift++)
                else dataByte = (dataByte << 1)
            }
            //console.log(dataByte.toString(2))
            return [op, dataByte]

        } else if (funcNum >= 9 && funcNum <= 12) {
            op = 9
            let dataByte = 0
            const currentStates = functionStates.slice(9, 13)
            //console.log("9 - 12", currentStates)
            let shift = 0
            for (let i = 3; i >= 0; i--) {
                if (currentStates[i].state) dataByte = dataByte | (1 << shift++)
                else dataByte = (dataByte << 1)
            }
            //console.log(dataByte.toString(2))
            return [op, dataByte]

        } else if (funcNum >= 13 && funcNum <= 20) {
            op = 0x15
            let dataByte = 0
            const currentStates = functionStates.slice(13, 21)
            //console.log("13 - 20", currentStates)
            let shift = 0
            for (let i = 7; i >= 0; i--) {
                if (currentStates[i].state) dataByte = dataByte | (1 << shift++)
                else dataByte = (dataByte << 1)
            }
            //console.log(dataByte.toString(2))
            return [op, dataByte]

        } else if (funcNum >= 21 && funcNum <= 28) {
            op = 0x16
            let dataByte = 0
            const currentStates = functionStates.slice(21, 29)
            //console.log("21 - 28", currentStates)
            let shift = 0
            for (let i = 7; i >= 0; i--) {
                if (currentStates[i].state) dataByte = dataByte | (1 << shift++)
                else dataByte = (dataByte << 1)
            }
            //console.log(dataByte.toString(2))
            return [op, dataByte]

        } else throw new Error('Error in setFunction')
    }

    if (!util.usbConnected) return
    dccInterface.sendMSG({
        type: 'locoCtrlCmd',
        data: [...getAddressBytes(address, true), ...makeOP()]
    })

}

export const sendAsyncSignal = (address: number, op: number, data: number) => {
    console.log("Seting Switch", address)
    if (!util.usbConnected) return
    dccInterface.sendMSG({
        type: 'asyncSignal',
        data: [...getAddressBytes(address, false), op, data]
    })
}

export const setCV = (address: number, cv: number, value: number) => {
    if (!util.usbConnected) return
    dccInterface.sendMSG({
        type: 'opsProgramming',
        data: [...getAddressBytes(address, true), ...getAddressBytes(cv, false), value]
    })

}


// PROGRAMMING
export const enableProgrammingTrack = async () => {
    return new Promise((resolve, reject) => {
        const trackStatus = (state: boolean) => {
            if (dccInterface) {
                dccInterface.programmingTrackEnabled = state
            }
            resolve(state)
        }

        if (dccInterface) {
            dccInterface.sendMSG({
                type: 'enableProgrammingTrack',
                data: null,
                callback: trackStatus
            })
        } else {
            reject(new Error('DCC Interface not available'))
        }
    })
}

export const disableProgrammingTrack = async () => {
    return new Promise((resolve, reject) => {
        const trackStatus = (state: boolean) => {
            if (dccInterface) {
                dccInterface.programmingTrackEnabled = state
            }
            resolve(state)
        }

        if (dccInterface) {
            dccInterface.sendMSG({
                type: 'disableProgrammingTrack',
                data: null,
                callback: trackStatus
            })
        } else {
            reject(new Error('DCC Interface not available'))
        }
    })
}

export const getProgrammingTrackStatus = () => dccInterface.programmingTrackEnabled;

export const readCvPrg = async (cv: number) => {
    return new Promise((resolve, reject) => {
        const cvVal = (state) => resolve(state)

        dccInterface.sendMSG({
            type: 'readCvPrg',
            data: [...getAddressBytes(cv, true)],
            callback: cvVal
        })

    })
}