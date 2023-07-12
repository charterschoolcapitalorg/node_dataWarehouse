var config = require('./dbconfig')
const sql = require('mssql')

// for testing
// query all data from test table
async function getDataFromSQL() {
    try {
        let pool = await sql.connect(config)
        let products = await pool.request().query("SELECT * from testData")
        return products.recordsets
    }
    catch (error) {
        console.log(error)
    }
}

// insert data into sql
async function insertCCDLastUpdate(ccd_last_update) {
    // wrap into single quotes
    let ccdlastUpdate = '\'' + ccd_last_update + '\''
    let queryString = 'INSERT INTO ccd_sch_last_update (CCD_LAST_UPDATE) VALUES (' + ccdlastUpdate + ')'
    try {
        let pool = await sql.connect(config)
        await pool.request().query(queryString)
        console.log('ccd record saved')
    }
    catch (error) {
        console.log(error)
    }
}

async function insertReonomyLastUpdate(reonomy_last_update) {
    // wrap into single quotes
    let reonomylastUpdate = '\'' + reonomy_last_update + '\''
    let queryString = 'INSERT INTO ccd_sch_last_update (CCD_LAST_UPDATE) VALUES (' + reonomylastUpdate + ')'
    try {
        let pool = await sql.connect(config)
        await pool.request().query(queryString)
        console.log('reonomy record saved')
    }
    catch (error) {
        console.log(error)
    }
}








// query three tables costar, reonomy, and ccd

// query ccd data
async function getCcdData() {
    try {
        // connect
        let pool = await sql.connect(config)

        // get ccd
        let ccdAzure = await pool.request().query("SELECT * from ccd_sch")

        // return
        return ccdAzure.recordsets
    }
    catch (error) {
        console.log(error)
    }
}

// query reonomy data
async function getReonomyData() {
    try {
        // connect
        let pool = await sql.connect(config)

        // get reonomy
        let reonomyAzure = await pool.request().query("SELECT * from reonomy")

        // return
        return reonomyAzure.recordsets
    }
    catch (error) {
        console.log(error)
    }
}

// query costar data
async function getCostarData() {
    try {
        // connect
        let pool = await sql.connect(config)

        // get costar
        let costarAzure = await pool.request().query("SELECT * from costar")

        // return
        return costarAzure.recordsets
    }
    catch (error) {
        console.log(error)
    }
}

// query costar data
async function getCddEnrollmentData() {
    try {
        // connect
        let pool = await sql.connect(config)

        // get ccd enrollment
        let ccdEnrollmentAzure = await pool.request().query("SELECT * from ccd_enrollment")

        // return
        return ccdEnrollmentAzure.recordsets
    }
    catch (error) {
        console.log(error)
    }
}






// need to query last update for all raw data sources
// query ccd last update
async function getCddLastUpdate() {
    try {
        let pool = await sql.connect(config)
        let ccdLastUpdateAzure = await pool.request().query("SELECT * from ccd_sch_last_update ORDER BY CCD_LAST_UPDATE DESC")
        return ccdLastUpdateAzure.recordsets
    }
    catch (error) {
        console.log(error)
    }
}

// query reonomy last update
async function getReonomyLastUpdate() {
    try {
        let pool = await sql.connect(config)
        let reonomyLastUpdateAzure = await pool.request().query("SELECT * from reonomy_last_update ORDER BY REONOMY_LAST_UPDATE DESC")
        return reonomyLastUpdateAzure.recordsets
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = {
    getDataFromSQL: getDataFromSQL,
    getCcdData: getCcdData,
    getReonomyData: getReonomyData,
    getCostarData: getCostarData,
    getCddEnrollmentData: getCddEnrollmentData,

    getCddLastUpdate: getCddLastUpdate,
    getReonomyLastUpdate: getReonomyLastUpdate,

    insertCCDLastUpdate: insertCCDLastUpdate,
    insertReonomyLastUpdate: insertReonomyLastUpdate
}