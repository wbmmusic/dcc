const { app } = require('electron')
const { existsSync, writeFileSync, mkdirSync, readFileSync, cpSync } = require('fs')
const { join } = require('path')

// PATHS
const pathToDataFolder = join(app.getPath('userData'), 'data')
const pathToConfigFile = join(pathToDataFolder, 'config.json')
const pathToImages = join(pathToDataFolder, 'images')
const pathToDefaultLocoImage = join(pathToImages, 'default.jpg')
exports.pathToImages = pathToImages

const defaultConfig = { locos: [], decoders: [], switches: [], consists: [], accessories: [], macros: [] }

if (!existsSync(pathToDataFolder)) {
    mkdirSync(pathToDataFolder)
    console.log("Created Data Folder")
} else console.log("Found Data Folder")

if (!existsSync(pathToImages)) {
    mkdirSync(pathToImages)
    console.log("Created Images Folder")
} else console.log("Found Images Folder")

if (!existsSync(pathToConfigFile)) {
    writeFileSync(pathToConfigFile, JSON.stringify(defaultConfig, null, '\t'))
    console.log("Created config.json")
} else console.log("Found config.json")

if (!existsSync(pathToDefaultLocoImage)) {
    try {
        cpSync(join(__dirname, 'default.jpg'), pathToDefaultLocoImage)
    } catch (error) {
        console.log(error)
    }

    console.log("Created Default Loco Image")
} else console.log("Found Default Loco Image")

let config = {}

const readFile = () => JSON.parse(readFileSync(pathToConfigFile))
const saveFile = () => {
    writeFileSync(pathToConfigFile, JSON.stringify(config, null, '\t'))
    readFile()
}

config = readFile()
exports.config = config

exports.newDecoder = (decoder) => {
    config.decoders.push(decoder)
    saveFile()
}

exports.deleteDecoder = (id) => {
    config.decoders = config.decoders.filter(dcdr => dcdr._id !== id)
    saveFile()
    return config.decoders
}

exports.getDecoderByID = (id) => {
    return config.decoders.find(dcdr => dcdr._id === id)
}

exports.updateDecoder = (updatedDecoder) => {
    let decoderIdx = config.decoders.findIndex(dcdr => dcdr._id === updatedDecoder._id)
    console.log("DCDR IDX", decoderIdx)
    config.decoders[decoderIdx] = updatedDecoder
    saveFile()
    return 'Updated'
}

exports.newLoco = (loco) => {
    config.locos.push(loco)
    saveFile()
    return 'created'
}

exports.deleteLoco = (locoID) => {
    config.locos = config.locos.filter(loco => loco._id !== locoID)
    saveFile()
    return config.locos
}

exports.getLocoByID = (id) => config.locos.find(loco => loco._id === id)