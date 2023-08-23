var config = require('./dbconfig')
const sql = require('mssql')



// for testing
// query all data from test table
// async function getDataFromSQL() {
//     try {
//         let pool = await sql.connect(config)
//         let products = await pool.request().query("SELECT * from testData")
//         return products.recordsets
//     }
//     catch (error) {
//         console.log(error)
//     }
// }

// insert data into sql
async function insertTestData(data) {
    // wrap into single quotes
    // let valueString = '\'' + data + '\''
    // let queryString = 'INSERT INTO charter_lldb_salesforce (Owner_ID, Tenant_Name, PROPERTY_ADDRESS_STREET) VALUES ' + data
    let queryString = 'INSERT INTO charter_lldb_salesforce (Owner_ID, Tenant_Name, STUDENT_COUNT, ESTIMATED_REVENUE_PER_STUDENT, PROPERTY_ADDRESS_STREET, PROPERTY_ADDRESS_CITY, PROPERTY_ADDRESS_STATE, PROPERTY_ADDRESS_ZIP_CODE, GROSS_BUILDING_AREA, MSA, MARKET_CAP_RATE, MARKET_SALE_PRICE_PER_SF, VALUATION_METHOD, CSC_SALE_PRICE_PER_SF_DISCOUNT, CSC_CAP_RATE_PREMIUM, RENT_TO_REVENUE_FLAT_ASSUMPTION, Account_ID, Industry, LLDB_Date_Added, LLDB_Last_Updated, Currently_Assigned_Broker, PRIMARY_CONTACT_FIRST_NAME, PRIMARY_CONTACT_LAST_NAME, PRIMARY_CONTACT_TITLE, PRIMARY_CONTACT_PHONE, PRIMARY_CONTACT_EMAIL, PRIMARY_CONTACT_ADDRESS, PRIMARY_CONTACT_CITY, PRIMARY_CONTACT_STATE, PRIMARY_CONTACT_ZIP_CODE, CONTACT_RECORD_TYPE_ID, TENANT_RECORD_TYPE_ID, ACCOUNT_RECORD_TYPE_ID, REONOMY_ID, CCD_ID, Account_Name) VALUES ' + data
    console.log('MY QUERY ------>')
    console.log(queryString)
    try {
        let pool = await sql.connect(config)
        await pool.request().query('DELETE FROM charter_lldb_salesforce')
        await pool.request().query(queryString)
    }
    catch (error) {
        // empty
    }
}







// insert data into last update tables
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
    let queryString = 'INSERT INTO reonomy_last_update (REONOMY_LAST_UPDATE) VALUES (' + reonomylastUpdate + ')'
    try {
        let pool = await sql.connect(config)
        await pool.request().query(queryString)
        console.log('reonomy record saved')
    }
    catch (error) {
        console.log(error)
    }
}

async function insertCcdEnrLastUpdate(ccd_enr_last_update) {
    // wrap into single quotes
    let ccdenrlastUpdate = '\'' + ccd_enr_last_update + '\''
    let queryString = 'INSERT INTO ccd_enrollment_last_update (CCD_ENROLLMENT_LAST_UPDATE) VALUES (' + ccdenrlastUpdate + ')'
    try {
        let pool = await sql.connect(config)
        await pool.request().query(queryString)
        console.log('ccd enr record saved')
    }
    catch (error) {
        console.log(error)
    }
}

async function insertCostarLastUpdate(costar_last_update) {
    // wrap into single quotes
    let costarlastUpdate = '\'' + costar_last_update + '\''
    let queryString = 'INSERT INTO costar_last_update (COSTAR_LAST_UPDATE) VALUES (' + costarlastUpdate + ')'
    try {
        let pool = await sql.connect(config)
        await pool.request().query(queryString)
        console.log('costar record saved')
    }
    catch (error) {
        console.log(error)
    }
}




// insert data into lldb table
// STEP 3 - Here I save data into lldb sql table
// +++++++++++++++++++++++++++++++++++++++++++++++
async function insertLLDB(valueString) {
    let queryString = 'INSERT INTO charter_lldb (Owner_ID, Tenant_Name, STUDENT_COUNT, ESTIMATED_REVENUE_PER_STUDENT, PROPERTY_ADDRESS_STREET, PROPERTY_ADDRESS_CITY, PROPERTY_ADDRESS_STATE, PROPERTY_ADDRESS_ZIP_CODE, GROSS_BUILDING_AREA, MSA, MARKET_CAP_RATE, MARKET_SALE_PRICE_PER_SF, VALUATION_METHOD, CSC_SALE_PRICE_PER_SF_DISCOUNT, CSC_CAP_RATE_PREMIUM, RENT_TO_REVENUE_FLAT_ASSUMPTION, Account_ID, Industry, LLDB_Date_Added, LLDB_Last_Updated, Currently_Assigned_Broker, PRIMARY_CONTACT_FIRST_NAME, PRIMARY_CONTACT_LAST_NAME, PRIMARY_CONTACT_TITLE, PRIMARY_CONTACT_PHONE, PRIMARY_CONTACT_EMAIL, PRIMARY_CONTACT_ADDRESS, PRIMARY_CONTACT_CITY, PRIMARY_CONTACT_STATE, PRIMARY_CONTACT_ZIP_CODE, CONTACT_RECORD_TYPE_ID, TENANT_RECORD_TYPE_ID, ACCOUNT_RECORD_TYPE_ID, REONOMY_ID, CCD_ID, Account_Name) VALUES ' + valueString
    console.log('full query string:')
    console.log(queryString)
    // delete data from lldb table first
    // insert data into lldb table
    try {
        let pool = await sql.connect(config)
        await pool.request().query('DELETE FROM charter_lldb')
        await pool.request().query(queryString)
        console.log('old lldb records deleted, new records saved')
    }
    catch (error) {
        console.log(error)
    }
}


// lldb save manual data
// +++++++++++++++++++++++++++++++++++++++++++++++
async function insertLLDBman(state, setString) {
    let queryString = 'UPDATE charter_lldb ' + setString + ' WHERE PROPERTY_ADDRESS_STATE = ' + '\'' + state + '\''
    console.log(queryString)
    try {
        let pool = await sql.connect(config)
        await pool.request().query(queryString)
        console.log('lldb manual records saved')
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

// query ccd enrollment last update
async function getCcdEnrLastUpdate() {
    try {
        let pool = await sql.connect(config)
        let ccsEnrLastUpdateAzure = await pool.request().query("SELECT * from ccd_enrollment_last_update ORDER BY CCD_ENROLLMENT_LAST_UPDATE DESC")
        return ccsEnrLastUpdateAzure.recordsets
    }
    catch (error) {
        console.log(error)
    }
}

// query costar last update
async function getCostarLastUpdate() {
    try {
        let pool = await sql.connect(config)
        let costarLastUpdateAzure = await pool.request().query("SELECT * from costar_last_update ORDER BY COSTAR_LAST_UPDATE DESC")
        return costarLastUpdateAzure.recordsets
    }
    catch (error) {
        console.log(error)
    }
}





// get lldb data
async function getLLDBData() {
    try {
        let pool = await sql.connect(config)
        let getLLDBFromAzure = await pool.request().query("SELECT * from charter_lldb")
        return getLLDBFromAzure.recordsets
    }
    catch (error) {
        console.log(error)
    }
}

// get lldb data
async function getSalesforceLLDBData() {
    try {
        let pool = await sql.connect(config)
        let getSfLLDBFromAzure = await pool.request().query("SELECT * from charter_lldb_salesforce")
        return getSfLLDBFromAzure.recordsets
    }
    catch (error) {
        console.log(error)
    }
}




// save json lldb data
// +++++++++++++++++++++++++++++++++++++++++++++++
async function inserJsontLLDB() {
    let valueString = 'Success'
    let queryString = 'INSERT INTO lldb_json (json_data) VALUES (' + '\'' + valueString + '\'' + ')'
    console.log('full query string:')
    console.log(queryString)
    // delete data from lldb table first
    // insert data into lldb table
    try {
        let pool = await sql.connect(config)
        await pool.request().query('DELETE FROM lldb_json')
        await pool.request().query(queryString)
        console.log('SUCCESS')
    }
    catch (error) {
        console.log(error)
    }
}

// save final lldb data
// +++++++++++++++++++++++++++++++++++++++++++++++
async function insertFinalLLDB(valueString) {
    let queryString = 'INSERT INTO charter_lldb_final (Owner_ID, Tenant_Name, STUDENT_COUNT, ESTIMATED_REVENUE_PER_STUDENT, PROPERTY_ADDRESS_STREET, PROPERTY_ADDRESS_CITY, PROPERTY_ADDRESS_STATE, PROPERTY_ADDRESS_ZIP_CODE, GROSS_BUILDING_AREA, MSA, MARKET_CAP_RATE, MARKET_SALE_PRICE_PER_SF, VALUATION_METHOD, CSC_SALE_PRICE_PER_SF_DISCOUNT, CSC_CAP_RATE_PREMIUM, RENT_TO_REVENUE_FLAT_ASSUMPTION, Account_ID, Industry, LLDB_Date_Added, LLDB_Last_Updated, Currently_Assigned_Broker, PRIMARY_CONTACT_FIRST_NAME, PRIMARY_CONTACT_LAST_NAME, PRIMARY_CONTACT_TITLE, PRIMARY_CONTACT_PHONE, PRIMARY_CONTACT_EMAIL, PRIMARY_CONTACT_ADDRESS, PRIMARY_CONTACT_CITY, PRIMARY_CONTACT_STATE, PRIMARY_CONTACT_ZIP_CODE, CONTACT_RECORD_TYPE_ID, TENANT_RECORD_TYPE_ID, ACCOUNT_RECORD_TYPE_ID, REONOMY_ID, CCD_ID, Account_Name) VALUES ' + valueString
    console.log('full query string:')
    console.log(queryString)
    // delete data from lldb table first
    // insert data into lldb table
    try {
        let pool = await sql.connect(config)
        await pool.request().query('DELETE FROM charter_lldb_final')
        await pool.request().query(queryString)
        console.log('SUCCESS')
    }
    catch (error) {
        console.log(error)
    }
}


module.exports = {
    // getDataFromSQL: getDataFromSQL,
    // get data from tables
    getCcdData: getCcdData,
    getReonomyData: getReonomyData,
    getCostarData: getCostarData,
    getCddEnrollmentData: getCddEnrollmentData,
    // get last update
    getCddLastUpdate: getCddLastUpdate,
    getReonomyLastUpdate: getReonomyLastUpdate,
    getCcdEnrLastUpdate: getCcdEnrLastUpdate,
    getCostarLastUpdate: getCostarLastUpdate,
    // insert
    insertCCDLastUpdate: insertCCDLastUpdate,
    insertReonomyLastUpdate: insertReonomyLastUpdate,
    insertCcdEnrLastUpdate: insertCcdEnrLastUpdate,
    insertCostarLastUpdate: insertCostarLastUpdate,

    insertLLDB: insertLLDB,
    insertLLDBman: insertLLDBman,

    getLLDBData: getLLDBData,
    getSalesforceLLDBData: getSalesforceLLDBData,
    
    insertTestData: insertTestData,

    inserJsontLLDB: inserJsontLLDB,
    insertFinalLLDB: insertFinalLLDB
}