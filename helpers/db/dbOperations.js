const {
    db
} = require("./dbInitialise.js");

var model;
/**
 *  This function is to create records via model
 *  @param {string} modelName tablename
 *  @param {object} record object of column name and values to be inserted into table
 *  @returns created record
 */
function createRecord(modelName, record, request) {
    model = modelName;
    return new Promise((resolve, reject) => {

        if (db[modelName]) {
            db[modelName].create(record, { request: request }).then(function (response) {
                /**
                 * to get plain data records from response
                 */
                // hookCreate(modelName, record)
                resolve(response.get({
                    plain: true
                }))
            })
                .catch(err => {
                    reject(new Error(err.message || "Error while creating record"))
                });
        } else {
            reject(new Error("Model not defined"))
        }
    });
}
  
/**
 *  This function is to update records via model
 *  @param {string} modelName tablename
 *  @param {object} query condition on basis of which records will be updated
 *  @param {object} record object of columnname and values to be updated in selected records
 *  @returns no. of records updated
 */

function updateRecord(modelName, query, record, request) {
    query.request = request;
    return new Promise((resolve, reject) => {

        if (db[modelName]) {
            db[modelName].update(record, query).then(function (data) {
                resolve(data);
            })
                .catch(err => {
                    reject(new Error(err.message || "Error while updating record"))
                });
        } else {
            reject(new Error("Model not defined"))
        }
    });
}
/**
 *  This function is to delete records via model
 *  @param {string} modelName table name
 *  @param {object} query condition on basis of which records will be deleted
 *  @returns max no. of records deleted(0 or 1)
 */
function deleteRecord(modelName, query) {
    return new Promise((resolve, reject) => {
        if (db[modelName]) {
            db[modelName].destroy(query).then(function (data) {
                resolve(data);
            })
                .catch(err => {
                    reject(new Error(err.message || "Error while deleting record"))
                });
        } else {
            reject(new Error("Model not defined"))
        }
    });
}

/**
 *  This function is to get records via model
 *  @param {string} modelName table name
 *  @param {object} query condition on basis of which records will be fetched
 *  @param isJoinTable if join is there
 *  @returns return the records based on query
 */

async function getRawRecords(modelName, query, isJoinTable) {
    if (!isJoinTable) {
        query.raw = true; // to get plain records
    }
    if (db[modelName]) {
        let response = await db[modelName].findAll(query);
        if (isJoinTable) {
            response = JSON.stringify(response);
            response = JSON.parse(response);
        }
        return response;
    } else {
        return Promise.reject(new Error("Model not defined"));
    }
}


module.exports = {
    db,
    createRecord,
    updateRecord,
    deleteRecord,
    getRawRecords
};