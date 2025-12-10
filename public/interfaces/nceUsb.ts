/**
 * NCE USB Interface Driver
 * 
 * Provides communication interface for NCE PowerCab DCC system via USB.
 * Handles locomotive control, programming track operations, and CV programming.
 * 
 * Protocol Implementation:
 * - NCE USB Interface Protocol v7.0
 * - Serial communication at 9600 baud
 * - Command/response pattern with acknowledgment
 * - Programming track support for decoder configuration
 */

import { SerialPort } from 'serialport';
import { ByteLengthParser } from '@serialport/parser-byte-length';
import { InterByteTimeoutParser } from '@serialport/parser-inter-byte-timeout';

/**
 * NCE USB Interface Class
 * 
 * Manages all communication with NCE PowerCab system including:
 * - Locomotive speed and direction control
 * - Function button activation (lights, sounds, etc.)
 * - Programming track operations for CV programming
 * - System status monitoring and error handling
 */
export class NceUSB {
    /** Command queue for sequential message processing */
    outBuffer: any[];
    /** Flag indicating if currently sending commands */
    sending: boolean;
    /** Programming track power state */
    programmingTrackEnabled: boolean;
    /** COM port path (e.g., "COM3", "/dev/ttyUSB0") */
    comPort: string;
    /** SerialPort instance for USB communication */
    port: SerialPort;
    /** Status callback function for connection state changes */
    status: (connected: boolean) => void;

    /**
     * Initialize NCE USB Interface
     * 
     * @param device - Device configuration containing comPort and status callback
     */
    constructor(device: { comPort: string; status: (connected: boolean) => void }) {
        this.outBuffer = []
        this.sending = false
        this.programmingTrackEnabled = false
        if (device) { Object.assign(this, { ...device }) }

        this.port = new SerialPort({ path: this.comPort, baudRate: 9600 })
        this.port.on('error', () => this.status(false))
        this.port.on('open', async () => {
            this.status(true)
            await this.disableProgrammingTrack()
            console.log("USB Software Ver", await this.getSoftwareVersion())
        })
    }
    /** Close the serial port connection */
    closeSerialPort = () => this.port.close()
    
    /** Get interface information */
    info = () => { return { ...this } }
    /**
     * Process next command in the output buffer
     * Handles different command types sequentially to prevent conflicts
     */
    sendNextInBuffer2 = async (): Promise<void> => {
        const cmd = this.outBuffer.shift()
        switch (cmd.type) {
            case 'locoCtrlCmd':
                await this.sendLocoCtrlCmd(cmd.data)
                break;

            case 'asyncSignal':
                await this.sendAsyncSignal(cmd.data)
                break

            case 'opsProgramming':
                await this.sendOpsProgrammingMsg(cmd.data)
                break

            case 'enableProgrammingTrack':
                try {
                    const trackStateEn = await this.enableProgrammingTrack()
                    console.log("Track State is", trackStateEn)
                    cmd.callback(this.programmingTrackEnabled)
                } catch (error) {
                    console.log(error)
                }
                break

            case 'disableProgrammingTrack':
                try {
                    const trackState = await this.disableProgrammingTrack()
                    console.log("Track State is", trackState)
                    cmd.callback(this.programmingTrackEnabled)
                } catch (error) {
                    console.log(error)
                }
                break

            case 'readCvPrg':
                try {
                    const cvVal = await this.readCvPrg(cmd.data)
                    console.log("CV val =", cvVal)
                    cmd.callback(cvVal)
                } catch (error) {
                    console.log(error)
                }
                break

            default:
                break;
        }
        if (this.outBuffer.length === 0) this.sending = false
        else this.sendNextInBuffer2()
    }
    /**
     * Queue a message for transmission
     * 
     * @param msg - Command message to send
     */
    sendMSG = (msg: any) => {
        console.log("Send Message", msg)
        this.outBuffer.push(msg)
        if (!this.sending) {
            this.sending = true
            this.sendNextInBuffer2()
        }
    }
    /**
     * Send locomotive control command (speed, direction, functions)
     * 
     * @param command - Command bytes for locomotive control
     * @returns Promise resolving to success message
     */
    private sendLocoCtrlCmd = async (command: number[]): Promise<string> => {
        console.log('sendLocoCtrlCmd')
        const parser = this.port.pipe(new ByteLengthParser({ length: 1 }))

        return new Promise<string>((resolve, reject) => {
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Sent Locomotive Control Command')
                else reject(new Error('Error in Locomotive Control Command'))
            })
            this.port.write([0xA2, ...command])
        })
    }
    /**
     * Send asynchronous signal command (accessory control)
     * 
     * @param command - Command bytes for accessory control
     * @returns Promise resolving to success message
     */
    private sendAsyncSignal = async (command: number[]): Promise<string> => {
        console.log('sendAsyncSignal')
        const parser = this.port.pipe(new ByteLengthParser({ length: 1 }))

        return new Promise<string>((resolve, reject) => {
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Sent Locomotive Control Command')
                else reject(new Error('Error in Locomotive Control Command'))
            })
            this.port.write([0xAD, ...command])
        })
    }
    /**
     * Send operations mode programming message (programming on main)
     * 
     * @param command - Command bytes for ops programming
     * @returns Promise resolving to success message
     */
    private sendOpsProgrammingMsg = async (command: number[]): Promise<string> => {
        console.log('sendOpsProgrammingMsg')
        const parser = this.port.pipe(new ByteLengthParser({ length: 1 }))

        return new Promise<string>((resolve, reject) => {
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Sent Ops Programming msg')
                else reject(new Error('Error Send ops programming message'))
            })
            this.port.write([0xAE, ...command])
        })
    }

    /**
     * Enable programming track power for CV programming
     * 
     * @returns Promise resolving to success message
     */
    enableProgrammingTrack = async (): Promise<string> => {
        console.log('Enable Programming Track')
        const parser = this.port.pipe(new ByteLengthParser({ length: 1 }))

        return new Promise<string>((resolve, reject) => {
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') {
                    this.programmingTrackEnabled = true
                    resolve('Enabled programming track')
                }
                else if (res === '3') reject('Short Circuit on programming track')
                else reject(new Error('Error Enabling programming track'))
            })
            this.port.write([0x9E])
        })
    }
    /**
     * Disable programming track power
     * 
     * @returns Promise resolving to success message
     */
    disableProgrammingTrack = async (): Promise<string> => {
        console.log('Disable Programming Track')
        const parser = this.port.pipe(new ByteLengthParser({ length: 1 }))

        return new Promise<string>((resolve, reject) => {
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') {
                    this.programmingTrackEnabled = false
                    resolve('Programming Track Disabled')
                }
                else reject(new Error('Error disabling programming track'))
            })
            this.port.write([0x9F])
        })
    }
    /**
     * Program CV in paged mode (legacy programming method)
     * 
     * @param command - Command bytes for paged mode programming
     * @returns Promise resolving to success message
     */
    programCvInPagedMode = async (command: number[]): Promise<string> => {
        console.log('programCvInPagedMode')
        const parser = this.port.pipe(new ByteLengthParser({ length: 1 }))

        return new Promise<string>((resolve, reject) => {
            if (command.length !== 3) reject(new Error('programCvInPagedMode expects 3 command bytes'))
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Programmed CV in paged mode')
                else if (res === '0') reject('Programming Track Not Enabled')
                else reject(new Error('Error Programming CV in paged mode'))
            })
            this.port.write([0xA0, ...command])
        })
    }

    /**
     * Program decoder register (legacy programming method)
     * 
     * @param command - Command bytes for register programming
     * @returns Promise resolving to success message
     */
    programRegister = async (command: number[]): Promise<string> => {
        console.log('programRegister')
        const parser = this.port.pipe(new ByteLengthParser({ length: 1 }))

        return new Promise<string>((resolve, reject) => {
            if (command.length !== 2) reject(new Error('programRegister expects 2 command bytes'))
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Programmed register')
                else if (res === '0') reject('Programming Track Not Enabled')
                else reject(new Error('Error Programming register'))
            })
            this.port.write([0xA6, ...command])
        })
    }

    /**
     * Read decoder register value
     * 
     * @param command - Register number to read
     * @returns Promise resolving to register value
     */
    readRegister = async (command: number[]): Promise<number> => {
        console.log('readRegister')
        const parser = this.port.pipe(new InterByteTimeoutParser({ interval: 500 }))

        return new Promise<number>((resolve, reject) => {
            if (command.length !== 1) reject(new Error('readRegister expects 1 command byte'))
            parser.once('data', (data) => {
                this.port.unpipe(parser)
                if (data.length === 0) reject(new Error('Error reading Register'))
                if (data[0].toString() === '0') reject('Programming Track Not Enabled')
                if (data.length > 1) {
                    if (data[1].toString() === '3') reject('Cant read register')
                    else if (data[1].toString() === '!') resolve(data[0])
                }
                reject(new Error('Error reading Register'))
            })
            this.port.write([0xA7, ...command])
        })
    }

    /**
     * Program CV value directly
     * 
     * @param command - CV number and value bytes
     * @returns Promise resolving to success message
     */
    programCV = async (command: number[]): Promise<string> => {
        console.log('programCV')
        const parser = this.port.pipe(new ByteLengthParser({ length: 1 }))

        return new Promise<string>((resolve, reject) => {
            if (command.length !== 3) reject(new Error('programCV expects 3 command bytes'))
            parser.once('data', (data) => {
                let res = data.toString()
                this.port.unpipe(parser)
                if (res === '!') resolve('Programmed CV')
                else if (res === '0') reject('Programming Track Not Enabled')
                else reject(new Error('Error Programming CV'))
            })
            this.port.write([0xA8, ...command])
        })
    }
    /**
     * Read CV value from programming track
     * 
     * @param command - CV address bytes to read
     * @returns Promise resolving to CV value
     */
    readCvPrg = async (command: number[]): Promise<number> => {
        console.log('readCV')
        const parser = this.port.pipe(new InterByteTimeoutParser({ interval: 20 }))

        return new Promise<number>((resolve, reject) => {
            if (command.length !== 2) reject(new Error('readCV expects 2 command bytes'))
            parser.once('data', (data) => {
                this.port.unpipe(parser)
                if (data.length === 0) reject(new Error('Error reading CV data length'))
                else if (data[0].toString() === '0') reject('Programming Track Not Enabled')
                else if (data.length > 1) {
                    if (data.toString()[1] === '3') reject('Cant read CV')
                    else if (data.toString()[1] === '!') resolve(data[0])
                    else reject(new Error('Error reading CV'))
                } else reject(new Error('Error reading CV'))
            })
            this.port.write([0xA9, ...command])
        })
    }

    /**
     * Get NCE USB interface software version
     * 
     * @returns Promise resolving to version data
     */
    getSoftwareVersion = async (): Promise<Buffer> => {
        console.log('getSoftwareVersion')
        const parser = this.port.pipe(new ByteLengthParser({ length: 3 }))

        return new Promise<Buffer>((resolve) => {
            parser.once('data', (data) => {
                this.port.unpipe(parser)
                resolve(data)
            })
            this.port.write([0xAA])
        })
    }
}

