const { app } = require('electron')
const { existsSync, writeFileSync, mkdirSync } = require('fs')
const { join } = require('path')

// PATHS
const pathToDataFolder = join(app.getPath('userData'), 'data')
const pathToConfigFile = join(pathToDataFolder, 'config.json')

const defaultConfig = {
    locos: []
}

if (!existsSync(pathToDataFolder)) {
    mkdirSync(pathToDataFolder)
    console.log("Created Data Folder")
} else console.log("Found Data Folder")

if (!existsSync(pathToConfigFile)) {
    writeFileSync(pathToConfigFile, JSON.stringify(defaultConfig, null, '\t'))
    console.log("Created config.json")
} else console.log("Found config.json")