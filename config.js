/**
 * This file contains app config functions
 */

const appConfiguration = require("./localConfig/config.json");

/**
 * This function fetches database config details from config.json file
 */
var getDatabaseConfiguration = () =>{
    console.log(appConfiguration.databaseConfiguration)
    return appConfiguration.databaseConfiguration;
}

module.exports = {
    getDatabaseConfiguration
}