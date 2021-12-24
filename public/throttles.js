const { config, getDecoderByID } = require("./utilities")

let throttles = []

config.locos.forEach(loco => {
    if (throttles.findIndex(thr => thr._id === loco._id) < 0) {

        const makeFunctions = () => {
            let out = []
            let functions = getDecoderByID(loco.decoder).functions
            functions.forEach(func => {

            })
            return out
        }

        throttles.push({
            ...loco,
            speed: 0,
            direction: 'stop',
            functions: makeFunctions()
        })
    }
});

exports.throttles = throttles