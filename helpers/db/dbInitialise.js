/**
 * This file contains database initialization and importing models logic
 */

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const appConfig = require('./../../config')
/**
 * If globally node environment is defined then use that else use localhost as env 
 */
const config = appConfig.getDatabaseConfiguration();
// const logConfig = appConfig.getLogConfiguration();
var db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config.option);


/**
 * In below function we are authenticating credentials for  database connection
 * Initialise models specifiedin models folder
 * Creates objects for each model for usage by controller
 * calls the sync model function for syncing the model if new changes are made in model definition.
 */

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');

        readAndInitialiseModel();
        syncModel();

    })
    .catch(err => {
        console.log('Unable to connect to the database:', err);
    });

/**
 * In this function creating the instances of model after importing and assigning it to db variable
 */

function readAndInitialiseModel() {
    /**
  * In below block we are
  * - Reading filenames of folder
  * - filtering js file names of folder
  * - importing all model js files
  */
    fs
        .readdirSync(path.resolve(__dirname, "../../models"))
        .filter(file => {
            return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
        })
        .forEach(file => {
            var model = sequelize['import'](path.join("../../models", file));
            db[model.name] = model;

        });

    /**
     * In below block we are calling associate function of model to establish relationship between models
     */

    Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
}

/**
 * This function is to sync the model changes if changes are made in model's definition
 */

async function syncModel() {
    try {
        await db.sequelize.sync();
        console.log('Model syncing done successfully.');
        return;
    } catch (e) {
        console.log("Error in syncing models", e)
    }
}


module.exports = {
    db
}
