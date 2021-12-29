const { NceUSB } = require('./interfaces/nceUsb')

const iface = { type: 'nceUsb', port: 'COM16' }

let nceBoard = new NceUSB({ comPort: iface.port })

/*
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
*/

const getAddressBytes = (address, useC0) => {
    var lowByte = address & 0xff
    var highByte = (address >> 8) & 0xff
    if (useC0) return [highByte | 0xC0, lowByte]
    return [highByte, lowByte]
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

    nceBoard.sendMSG({
        type: 'locoCtrlCmd',
        data: [...getAddressBytes(address, true), ...makeDirection(direction, speed)]
    })
}

exports.sendEStop = (address, direction) => {
    const makeDirection = () => {
        if (direction === "forward") return 5
        else if (direction === 'reverse') return 6
        else throw new Error("E Stop Error")
    }

    nceBoard.sendMSG({
        type: 'locoCtrlCmd',
        data: [...getAddressBytes(address, true), makeDirection(), 0]
    })
}

exports.setFunction = (address, funcNum, functionStates) => {
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

    nceBoard.sendMSG({
        type: 'locoCtrlCmd',
        data: [...getAddressBytes(address, true), ...makeOP()]
    })

}

exports.sendAsyncSignal = (address, op, data) => {
    console.log("Seting Switch", address)
    nceBoard.sendMSG({
        type: 'asyncSignal',
        data: [...getAddressBytes(address, false), op, data]
    })
}

exports.setCV = (address, cv, value) => {
    nceBoard.sendMSG({
        type: 'opsProgramming',
        data: [...getAddressBytes(address, true), ...getAddressBytes(cv, false), value]
    })

}