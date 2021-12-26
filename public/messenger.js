const SerialPort = require('serialport')
const port = new SerialPort('COM16', { baudRate: 9600 })

const listPorts = () => {
    SerialPort.list().then(
        ports => {
            if (ports.length > 0) console.log('PORTLIST')
            ports.forEach(port => {
                console.log(`${port.path}\t${port.pnpId || ''}\t${port.manufacturer || ''}`)
                console.log(port)
            })
        },
        err => console.error('Error listing ports', err)
    )
}

const getAddressBytes = (address) => {
    var lowByte = address & 0xff
    var highByte = (address >> 8) & 0xff
    var highBytex = highByte | 0xC0

    let output = [highBytex, lowByte]

    return output
}

exports.setSpeedAndDir = (address, speed, direction) => {
    console.log(`Address: ${address} | Speed: ${speed} | Direction: ${direction}`)

    const makeDirection = (direction, speed) => {
        let out = [direction, speed]
        if (direction === 'forward') out[0] = 4
        else if (direction === 'reverse') out[0] = 3
        else out = [4, 0]

        return out
    }
    port.write([0xA2, ...getAddressBytes(address), ...makeDirection(direction, speed)])
}

exports.sendEStop = (address, direction) => {
    const makeDirection = () => {
        if (direction === "forward") {
            return 6
        } else if (direction === 'reverse') {
            return 5
        } else throw new Error("E Stop Error")
    }
    port.write([0xA2, ...getAddressBytes(address), makeDirection(), 0])
}

exports.setFunction = (address, funcNum, functionStates) => {
    console.log(address)

    const makeOP = () => {
        let out = [0, 0x10]
        if (funcNum >= 0 && funcNum <= 4) {
            console.log("0 - 4")
            const currentStates = functionStates.slice(0, 5)
            console.log(currentStates)
            out[0] = 7
        } else if (funcNum >= 5 && funcNum <= 8) {
            console.log("5 - 8")
            const currentStates = functionStates.slice(5, 9)
            console.log(currentStates)
            out[0] = 7
        } else if (funcNum >= 9 && funcNum <= 12) {
            console.log("9 - 12")
            const currentStates = functionStates.slice(9, 13)
            console.log(currentStates)
            out[0] = 9
        } else if (funcNum >= 13 && funcNum <= 20) {
            console.log("13 - 20")
            const currentStates = functionStates.slice(13, 21)
            console.log(currentStates)
            out[0] = 0x15
        } else if (funcNum >= 21 && funcNum <= 28) {
            console.log("21 - 28")
            const currentStates = functionStates.slice(21, 29)
            console.log(currentStates)
            out[0] = 0x16
        } else throw new Error('Error in setFunction')
        return out
    }


    port.write([0xA2, ...getAddressBytes(address), ...makeOP()])
}

listPorts()

port.on('error', (err) => console.log('USB Error: ', err.message))
port.on('readable', (data) => console.log(data))
port.on('data', (data) => console.log('USB received data: ', data))