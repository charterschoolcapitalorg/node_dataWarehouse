// Charter School Capital - 2023
// Developer: Slava Krel
// Description: LLDB

// refer to https://www.youtube.com/watch?v=-MTSQjw5DrM
// npm init -y
// npm install express
// create index.js and index.html
// start server 'node .'
// make calls to this endpoint -- install 'npm install request'
// file upload -- install 'npm install express-fileupload'
// azure storage hook -- npm install azure-storage'
// into stream -- npm install into-stream@6.0.0
// to kill running node -- killall -9 node

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'
const request = require('request')
const azure = require('azure-storage')
const fileUpload = require("express-fileupload")
const getStream = require('into-stream')
var Db = require('./components/dboperations')
var lu = require('./components/lastupdate')
const fs = require('fs')
let converter = require('json-2-csv')
// View Engine Setup
const path = require('path')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
const blobService = azure.createBlobService('DefaultEndpointsProtocol=https;AccountName=cscdwfileupload;AccountKey=RlreQ0k6PR39bPVw5aEsjvk3LnIFBQXfmixD9sMBlYL+I2LcMlMveb/L6YT5a7gg6+FqMFsYMsyP+AStNiTApQ==;EndpointSuffix=core.windows.net')
app.use(express.static('page'))

// alerts 
// alers dont work here
// var popup = require('popups')
// let alert = require('alert')

// to read form values
var bodyParser = require('body-parser')
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// app start
// when the page first load or reload
app.get('/', async function (req, res) {
    console.log('@@@ main screen loal/re-load')
    res.render('index', {
        serverResponse: 'Server is ready. Last time Salesforce data has been synced with Azure on {date}.',
        ccdLastUpdate: await lu.getCcdLastUpdatedDate(),
        enrLastUpdate: await lu.getEnrLastUpdatedDate(),
        reonomyLastUpdate: await lu.getReonomyLastUpdatedDate(),
        coStarLastUpdate: await lu.getCoStarLastUpdatedDate(),
        ccdPipeStatus: 'No Status', 
        ccdEnrPipeStatus: 'No Status',
        reonomyPipeStatus: 'No Status',
        stFundPipeStatus: 'No Status',
        coStarPipeStatus: 'No Status'
    })
})

// for testing only
// generate in-rogress fail success response
// generate response IN PROGRESS and keep it for ... seconds
// after ... seconds generate respond SUCCESS
app.get('/fake/response', async function (req, res) {
    
    // assign response value
    ccdPipeStatus = 'response'
    ccdEnrPipeStatus = 'response'
    reonomyPipeStatus = 'response'
    stFundPipeStatus = 'response'
    coStarPipeStatus = 'response'
    serverResponse = 'Success. Check Status request has been sent.'
    
    res.render('index', {
        serverResponse: serverResponse,
        ccdLastUpdate: await lu.getCcdLastUpdatedDate(),
        enrLastUpdate: await lu.getEnrLastUpdatedDate(),
        reonomyLastUpdate: await lu.getReonomyLastUpdatedDate(),
        coStarLastUpdate: await lu.getCoStarLastUpdatedDate(),
        ccdPipeStatus: ccdPipeStatus,
        ccdEnrPipeStatus: ccdEnrPipeStatus,
        reonomyPipeStatus: reonomyPipeStatus,
        stFundPipeStatus: stFundPipeStatus,
        coStarPipeStatus: coStarPipeStatus
    })
})


// from azure send api call here 
app.get('/response/success', function (req, res) {

    res.send({
        message: 'my app returns success'
    })
})








app.get('/buildmasterlldb', async function (req, res) {

    // support last update functionality
    // query sql to find out when the data was updated
    // create global variables
    let ccdDataArray = []
    let reonomyDataArray = []
    let costarDataArray = []
    let ccdEnrDataArray = []

    let ccdLastUpdateOLD = []
    let reonomyLastUpdateOLD = []
    let ccdenrLastUpdateOLD = []
    let costarLastUpdateOLD = []

    // use async-await to get sql data out of the request
    // get ccd data
    await Db.getCcdData()
        .then((ccdData) => {
            ccdDataArray = ccdData[0]
        })
    await Db.getCddLastUpdate()
        .then((ccdLastUpdate) => {
            ccdLastUpdateOLD = ccdLastUpdate[0]
        })


    // get reonomy data
    await Db.getReonomyData()
        .then((reonomyData) => {
            reonomyDataArray = reonomyData[0]
        })
    await Db.getReonomyLastUpdate()
        .then((reonomyLastUpdate) => {
            reonomyLastUpdateOLD = reonomyLastUpdate[0]
        })


    // get costar data
    await Db.getCostarData()
        .then((costarData) => {
            costarDataArray = costarData[0]
        })
    await Db.getCostarLastUpdate()
        .then((costarLastUpdate) => {
            costarLastUpdateOLD = costarLastUpdate[0]
        })

    // get ccd enr data
    await Db.getCddEnrollmentData()
        .then((ccdEnrData) => {
            ccdEnrDataArray = ccdEnrData[0]
        })
    await Db.getCcdEnrLastUpdate()
        .then((ccdenrLastUpdate) => {
            ccdenrLastUpdateOLD = ccdenrLastUpdate[0]
        })

    let ccdLastUpdate = ccdDataArray[0].LAST_UPDATE
    let reonomyLastUpdate = reonomyDataArray[0].LAST_UPDATE
    let costarLastUpdate = costarDataArray[0].LAST_UPDATE
    let ccdEnrLastUpdate = ccdEnrDataArray[0].LAST_UPDATE


    // old and new dates ccd
    let ccdNewDate = new Date(ccdLastUpdate)
    let ccdOldDate = new Date(ccdLastUpdateOLD[0].CCD_LAST_UPDATE)
    // old and new dates reonomy
    let reonomyNewDate = new Date(reonomyLastUpdate)
    let reonomyOldDate = new Date(reonomyLastUpdateOLD[0].REONOMY_LAST_UPDATE)
    // old and new dates ccd enrollment
    let ccdenrNewDate = new Date(ccdEnrLastUpdate)
    let ccdenrOldDate = new Date(ccdenrLastUpdateOLD[0].CCD_ENROLLMENT_LAST_UPDATE)
    // old and new dates costar
    let costarNewDate = new Date(costarLastUpdate)
    let costarOldDate = new Date(costarLastUpdateOLD[0].COSTAR_LAST_UPDATE)



    // lldb refresh kick in when raw data has been updated
    if (ccdNewDate.toString() !== ccdOldDate.toString()
        || reonomyNewDate.toString() !== reonomyOldDate.toString()
        || ccdenrNewDate.toString() !== ccdenrOldDate.toString()
        || costarNewDate.toString() !== costarOldDate.toString()) {

        console.log('fire update')

        // STEP 1 - here I sync the last update tables
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        // CCD convert dates and create a record
        if (ccdNewDate.toString() !== ccdOldDate.toString()) {
            console.log('ccd data is new')
            let time = ccdNewDate.toISOString().split('T')[1]
            let insertIntoSQLccd = ccdNewDate.toISOString().split('T')[0] + ' ' + time.substring(0, time.length - 1)
            Db.insertCCDLastUpdate(insertIntoSQLccd.toString())
        }

        // Reonomy convert dates and create a record
        if (reonomyNewDate.toString() !== reonomyOldDate.toString()) {
            console.log('reonomy data is new')
            let time = reonomyNewDate.toISOString().split('T')[1]
            let insertIntoSQLreonomy = reonomyNewDate.toISOString().split('T')[0] + ' ' + time.substring(0, time.length - 1)
            Db.insertReonomyLastUpdate(insertIntoSQLreonomy.toString())
        }

        // CCD Enr convert dates and create a record
        if (ccdenrNewDate.toString() !== ccdenrOldDate.toString()) {
            console.log('ccd enr data is new')
            let time = ccdenrNewDate.toISOString().split('T')[1]
            let insertIntoSQLccdenr = ccdenrNewDate.toISOString().split('T')[0] + ' ' + time.substring(0, time.length - 1)
            Db.insertCcdEnrLastUpdate(insertIntoSQLccdenr.toString())
        }

        // Costar convert dates and create a record
        if (costarNewDate.toString() !== costarOldDate.toString()) {
            console.log('costar data is new')
            let time = costarNewDate.toISOString().split('T')[1]
            let insertIntoSQLcostar = costarNewDate.toISOString().split('T')[0] + ' ' + time.substring(0, time.length - 1)
            Db.insertCostarLastUpdate(insertIntoSQLcostar.toString())
        }


        // STEP 2 - Here I assemble the lldb table
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        var lldbArray = [];

        // bring ccd data
        for (var ccd_i = 0; ccd_i < ccdDataArray.length; ccd_i++) {
            var ccd_obj = ccdDataArray[ccd_i]
            // console.log('------->', ccd_obj.STATENAME)
            var lldbItem = {
                Owner_ID: null,
                Tenant_Name: ccd_obj.SCH_NAME,
                STUDENT_COUNT: null,
                ESTIMATED_REVENUE_PER_STUDENT: null,
                PROPERTY_ADDRESS_STREET: ccd_obj.LSTREET1, // School site is CCD data if reonomy data is missing
                PROPERTY_ADDRESS_CITY: ccd_obj.LCITY, // School site is CCD data if reonomy data is missing
                PROPERTY_ADDRESS_STATE: ccd_obj.LSTATE, // School site is CCD data if reonomy data is missing
                PROPERTY_ADDRESS_ZIP_CODE: ccd_obj.LZIP, // School site is CCD data if reonomy data is missing
                GROSS_BUILDING_AREA: null,
                MSA: null,
                MARKET_CAP_RATE: null,
                MARKET_SALE_PRICE_PER_SF: null,
                VALUATION_METHOD: null,
                CSC_SALE_PRICE_PER_SF_DISCOUNT: null, // psfdiscount
                CSC_CAP_RATE_PREMIUM: null,
                RENT_TO_REVENUE_FLAT_ASSUMPTION: null,
                Account_ID: null,
                Industry: null,
                LLDB_Date_Added: null,
                LLDB_Last_Updated: null,
                Currently_Assigned_Broker: null,
                PRIMARY_CONTACT_FIRST_NAME: null,
                PRIMARY_CONTACT_LAST_NAME: null,
                PRIMARY_CONTACT_TITLE: null,
                PRIMARY_CONTACT_PHONE: null,
                PRIMARY_CONTACT_EMAIL: null,
                PRIMARY_CONTACT_ADDRESS: null,
                PRIMARY_CONTACT_CITY: null,
                PRIMARY_CONTACT_STATE: null,
                PRIMARY_CONTACT_ZIP_CODE: null,
                CONTACT_RECORD_TYPE_ID: null,
                TENANT_RECORD_TYPE_ID: null,
                ACCOUNT_RECORD_TYPE_ID: null,
                REONOMY_ID: ccd_obj.reonomy_id,
                CCD_ID: ccd_obj.SCHID,
                Account_Name: null
            }

            // bring ccd enr data
            // TODO: ccd_obj.SCHID is a number, but ccs_enr_obj.SCHID is a string, so either one has to be converted
            // adjust data types in sql to correct this
            for (var ccs_enr_i = 0; ccs_enr_i < ccdEnrDataArray.length; ccs_enr_i++) {
                var ccs_enr_obj = ccdEnrDataArray[ccs_enr_i]
                if (ccd_obj.SCHID.toString() == ccs_enr_obj.SCHID) {
                    lldbItem.STUDENT_COUNT = ccs_enr_obj.STUDENT_COUNT
                }
            }

            // bring costar data
            // Important!!! - convert data toLowerCase() before comparison
            for (var costar_i = 0; costar_i < costarDataArray.length; costar_i++) {
                var costar_obj = costarDataArray[costar_i]
                if (ccd_obj.LCITY.toLowerCase() == costar_obj.CITY.toLowerCase() && ccd_obj.LSTATE.toLowerCase() == costar_obj.STATE.toLowerCase()) {
                    lldbItem.MARKET_CAP_RATE = costar_obj.Overall_Market_Cap_Rate
                    lldbItem.MARKET_SALE_PRICE_PER_SF = costar_obj.Market_Sale_Price_per_SF
                }
            }

            // bring reonomy data
            for (var reonomy_i = 0; reonomy_i < reonomyDataArray.length; reonomy_i++) {
                var reonomy_obj = reonomyDataArray[reonomy_i]
                if (ccd_obj.reonomy_id == reonomy_obj.reonomy_id) {
                    // replace school site address data if reonomy data is not null
                    if (reonomy_obj.address_line_1 !== null && reonomy_obj.address_city !== null && reonomy_obj.address_state !== null && reonomy_obj.address_postal_code !== null) {
                        lldbItem.PROPERTY_ADDRESS_STREET = reonomy_obj.address_line_1
                        lldbItem.PROPERTY_ADDRESS_CITY = reonomy_obj.address_city
                        lldbItem.PROPERTY_ADDRESS_STATE = reonomy_obj.address_state
                        lldbItem.PROPERTY_ADDRESS_ZIP_CODE = reonomy_obj.address_postal_code
                    }

                    lldbItem.GROSS_BUILDING_AREA = reonomy_obj.gross_building_area
                    lldbItem.Account_Name = reonomy_obj.reported_owner_name

                    // if the name is empty
                    let fullName = reonomy_obj.contact_name
                    if (fullName === null) {
                        // assign null to first and last names
                        lldbItem.PRIMARY_CONTACT_FIRST_NAME = fullName
                        lldbItem.PRIMARY_CONTACT_LAST_NAME = fullName
                    } else {
                        // split first and last names and assing them to separate variables
                        let parts = fullName.split(' ') // <----- array
                        if (parts.length > 1) {
                            let firstName = parts.shift()
                            let lastName = parts.join(' ')
                            let lastNameParts = lastName.split(' ') // <----- array
                            let lastNameAdjusted = ''
                            for (var word_i = 0; word_i < lastNameParts.length; word_i++) {
                                if (parts[word_i].indexOf('.') !== -1) {
                                    lastNameAdjusted += ''
                                } else {
                                    if (lastNameParts[word_i].length > 1) { // changed from > 2
                                        lastNameAdjusted += lastNameParts[word_i]
                                        if (lastNameParts.length > 1) {
                                            lastNameAdjusted += ' '
                                        }
                                    }
                                }
                            }
                            lldbItem.PRIMARY_CONTACT_FIRST_NAME = firstName
                            // lldbItem.PRIMARY_CONTACT_LAST_NAME = lastNameAdjusted

                            if (lastNameAdjusted === '') {
                                for (var wordq_i = 0; wordq_i < lastNameParts.length; wordq_i++) {
                                    if (parts[wordq_i].indexOf('.') !== -1) {
                                        lastNameAdjusted += ''
                                    } else {
                                        lastNameAdjusted += lastNameParts[wordq_i]
                                    }
                                }
                            }

                            if (lastNameAdjusted === '') {
                                lastNameAdjusted += 'not defined'
                            }

                            lldbItem.PRIMARY_CONTACT_LAST_NAME = lastNameAdjusted
                        }
                    }

                    lldbItem.PRIMARY_CONTACT_TITLE = reonomy_obj.contact_title
                    lldbItem.PRIMARY_CONTACT_PHONE = reonomy_obj.contact_phone_1
                    lldbItem.PRIMARY_CONTACT_EMAIL = reonomy_obj.contact_email_1
                    lldbItem.PRIMARY_CONTACT_ADDRESS = reonomy_obj.contact_address_1_line_1
                    lldbItem.PRIMARY_CONTACT_CITY = reonomy_obj.contact_address_1_city
                    lldbItem.PRIMARY_CONTACT_STATE = reonomy_obj.contact_address_1_state
                    lldbItem.PRIMARY_CONTACT_ZIP_CODE = reonomy_obj.contact_address_1_postal_code
                }
            }

            lldbArray.push(lldbItem)

        }

        // Usefull: check the array before export 
        console.log('-----> my lldb table with ccd+enrollment+costar+reonomy data  ---->', lldbArray.length)

        // STEP 3 - Combine raw data with sf data
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        if(lldbArray.length !== 0) {

            let rawLldb = lldbArray
            let sfLldb = []

            await Db.getSalesforceLLDBData()
                .then((data) => {
                    sfLldb = data[0]
                })

            let getsPushedIntoSF = [] // also use to export 
            let toUpdate = []
            let toCreate = []
            const haveBeenProcessed = new Map()
        
            const idMap = new Map() // holds reonomy+ccd ids as a key AND record as values
            for (var i = 0; i < rawLldb.length; i++) {
                const key = '\'' + rawLldb[i].REONOMY_ID + rawLldb[i].CCD_ID + '\''
                idMap.set(key, rawLldb[i])
            }
        
            for (var i_upd = 0; i_upd < sfLldb.length; i_upd++) {
                var key = '\'' + sfLldb[i_upd].REONOMY_ID + sfLldb[i_upd].CCD_ID + '\''
                if (idMap.has(key)) {
                    const newDataObject = idMap.get(key)
                    // here i need to update the values
                    if (sfLldb[i_upd].Tenant_Name !== newDataObject.Tenant_Name && newDataObject.Tenant_Name !== 'null') {
                        sfLldb[i_upd].Tenant_Name = newDataObject.Tenant_Name
                    }
                    if (sfLldb[i_upd].STUDENT_COUNT !== newDataObject.STUDENT_COUNT && newDataObject.STUDENT_COUNT !== 'null') {
                        sfLldb[i_upd].STUDENT_COUNT = newDataObject.STUDENT_COUNT
                    }
                    if (sfLldb[i_upd].ESTIMATED_REVENUE_PER_STUDENT !== newDataObject.ESTIMATED_REVENUE_PER_STUDENT && newDataObject.ESTIMATED_REVENUE_PER_STUDENT !== 'null') {
                        sfLldb[i_upd].ESTIMATED_REVENUE_PER_STUDENT = newDataObject.ESTIMATED_REVENUE_PER_STUDENT
                    }
                    if (sfLldb[i_upd].PROPERTY_ADDRESS_STREET !== newDataObject.PROPERTY_ADDRESS_STREET && newDataObject.PROPERTY_ADDRESS_STREET !== 'null') {
                        sfLldb[i_upd].PROPERTY_ADDRESS_STREET = newDataObject.PROPERTY_ADDRESS_STREET
                    }
                    if (sfLldb[i_upd].PROPERTY_ADDRESS_CITY !== newDataObject.PROPERTY_ADDRESS_CITY && newDataObject.PROPERTY_ADDRESS_CITY !== 'null') {
                        sfLldb[i_upd].PROPERTY_ADDRESS_CITY = newDataObject.PROPERTY_ADDRESS_CITY
                    }
                    if (sfLldb[i_upd].PROPERTY_ADDRESS_STATE !== newDataObject.PROPERTY_ADDRESS_STATE && newDataObject.PROPERTY_ADDRESS_STATE !== 'null') {
                        sfLldb[i_upd].PROPERTY_ADDRESS_STATE = newDataObject.PROPERTY_ADDRESS_STATE
                    }
                    if (sfLldb[i_upd].PROPERTY_ADDRESS_ZIP_CODE !== newDataObject.PROPERTY_ADDRESS_ZIP_CODE && newDataObject.PROPERTY_ADDRESS_ZIP_CODE !== 'null') {
                        sfLldb[i_upd].PROPERTY_ADDRESS_ZIP_CODE = newDataObject.PROPERTY_ADDRESS_ZIP_CODE
                    }
                    if (sfLldb[i_upd].GROSS_BUILDING_AREA !== newDataObject.GROSS_BUILDING_AREA && newDataObject.GROSS_BUILDING_AREA !== 'null') {
                        sfLldb[i_upd].GROSS_BUILDING_AREA = newDataObject.GROSS_BUILDING_AREA
                    }
                    if (sfLldb[i_upd].MSA !== newDataObject.MSA && newDataObject.MSA !== 'null') {
                        sfLldb[i_upd].MSA = newDataObject.MSA
                    }
                    if (sfLldb[i_upd].MARKET_CAP_RATE !== newDataObject.MARKET_CAP_RATE && newDataObject.MARKET_CAP_RATE !== 'null') {
                        sfLldb[i_upd].MARKET_CAP_RATE = newDataObject.MARKET_CAP_RATE
                    }
                    if (sfLldb[i_upd].MARKET_SALE_PRICE_PER_SF !== newDataObject.MARKET_SALE_PRICE_PER_SF && newDataObject.MARKET_SALE_PRICE_PER_SF !== 'null') {
                        sfLldb[i_upd].MARKET_SALE_PRICE_PER_SF = newDataObject.MARKET_SALE_PRICE_PER_SF
                    }
                    if (sfLldb[i_upd].VALUATION_METHOD !== newDataObject.VALUATION_METHOD && newDataObject.VALUATION_METHOD !== 'null') {
                        sfLldb[i_upd].VALUATION_METHOD = newDataObject.VALUATION_METHOD
                    }
                    if (sfLldb[i_upd].CSC_SALE_PRICE_PER_SF_DISCOUNT !== newDataObject.CSC_SALE_PRICE_PER_SF_DISCOUNT && newDataObject.CSC_SALE_PRICE_PER_SF_DISCOUNT !== 'null') {
                        sfLldb[i_upd].CSC_SALE_PRICE_PER_SF_DISCOUNT = newDataObject.CSC_SALE_PRICE_PER_SF_DISCOUNT
                    }
                    if (sfLldb[i_upd].CSC_CAP_RATE_PREMIUM !== newDataObject.CSC_CAP_RATE_PREMIUM && newDataObject.CSC_CAP_RATE_PREMIUM !== 'null') {
                        sfLldb[i_upd].CSC_CAP_RATE_PREMIUM = newDataObject.CSC_CAP_RATE_PREMIUM
                    }
                    if (sfLldb[i_upd].RENT_TO_REVENUE_FLAT_ASSUMPTION !== newDataObject.RENT_TO_REVENUE_FLAT_ASSUMPTION && newDataObject.RENT_TO_REVENUE_FLAT_ASSUMPTION !== 'null') {
                        sfLldb[i_upd].RENT_TO_REVENUE_FLAT_ASSUMPTION = newDataObject.RENT_TO_REVENUE_FLAT_ASSUMPTION
                    }
                    if (sfLldb[i_upd].Industry !== newDataObject.Industry && newDataObject.Industry !== 'null') {
                        sfLldb[i_upd].Industry = newDataObject.Industry
                    }
                    if (sfLldb[i_upd].LLDB_Date_Added !== newDataObject.LLDB_Date_Added && newDataObject.LLDB_Date_Added !== 'null') {
                        sfLldb[i_upd].LLDB_Date_Added = newDataObject.LLDB_Date_Added
                    }
                    if (sfLldb[i_upd].LLDB_Last_Updated !== newDataObject.LLDB_Last_Updated && newDataObject.LLDB_Last_Updated !== 'null') {
                        sfLldb[i_upd].LLDB_Last_Updated = newDataObject.LLDB_Last_Updated
                    }
        
        
                    if (sfLldb[i_upd].Currently_Assigned_Broker !== newDataObject.Currently_Assigned_Broker && newDataObject.Currently_Assigned_Broker !== 'null') {
                        sfLldb[i_upd].Currently_Assigned_Broker = newDataObject.Currently_Assigned_Broker
                    }
                    if (sfLldb[i_upd].PRIMARY_CONTACT_FIRST_NAME !== newDataObject.PRIMARY_CONTACT_FIRST_NAME && newDataObject.PRIMARY_CONTACT_FIRST_NAME !== 'null') {
                        sfLldb[i_upd].PRIMARY_CONTACT_FIRST_NAME = newDataObject.PRIMARY_CONTACT_FIRST_NAME
                    }
                    if (sfLldb[i_upd].PRIMARY_CONTACT_LAST_NAME !== newDataObject.PRIMARY_CONTACT_LAST_NAME && newDataObject.PRIMARY_CONTACT_LAST_NAME !== 'null') {
                        sfLldb[i_upd].PRIMARY_CONTACT_LAST_NAME = newDataObject.PRIMARY_CONTACT_LAST_NAME
                    }
                    if (sfLldb[i_upd].PRIMARY_CONTACT_TITLE !== newDataObject.PRIMARY_CONTACT_TITLE && newDataObject.PRIMARY_CONTACT_TITLE !== 'null') {
                        sfLldb[i_upd].PRIMARY_CONTACT_TITLE = newDataObject.PRIMARY_CONTACT_TITLE
                    }
                    if (sfLldb[i_upd].PRIMARY_CONTACT_PHONE !== newDataObject.PRIMARY_CONTACT_PHONE && newDataObject.PRIMARY_CONTACT_PHONE !== 'null') {
                        sfLldb[i_upd].PRIMARY_CONTACT_PHONE = newDataObject.PRIMARY_CONTACT_PHONE
                    }
                    if (sfLldb[i_upd].PRIMARY_CONTACT_EMAIL !== newDataObject.PRIMARY_CONTACT_EMAIL && newDataObject.PRIMARY_CONTACT_EMAIL !== 'null') {
                        sfLldb[i_upd].PRIMARY_CONTACT_EMAIL = newDataObject.PRIMARY_CONTACT_EMAIL
                    }
                    if (sfLldb[i_upd].PRIMARY_CONTACT_ADDRESS !== newDataObject.PRIMARY_CONTACT_ADDRESS && newDataObject.PRIMARY_CONTACT_ADDRESS !== 'null') {
                        sfLldb[i_upd].PRIMARY_CONTACT_ADDRESS = newDataObject.PRIMARY_CONTACT_ADDRESS
                    }
                    if (sfLldb[i_upd].PRIMARY_CONTACT_CITY !== newDataObject.PRIMARY_CONTACT_CITY && newDataObject.PRIMARY_CONTACT_CITY !== 'null') {
                        sfLldb[i_upd].PRIMARY_CONTACT_CITY = newDataObject.PRIMARY_CONTACT_CITY
                    }
                    if (sfLldb[i_upd].PRIMARY_CONTACT_STATE !== newDataObject.PRIMARY_CONTACT_STATE && newDataObject.PRIMARY_CONTACT_STATE !== 'null') {
                        sfLldb[i_upd].PRIMARY_CONTACT_STATE = newDataObject.PRIMARY_CONTACT_STATE
                    }
                    if (sfLldb[i_upd].PRIMARY_CONTACT_ZIP_CODE !== newDataObject.PRIMARY_CONTACT_ZIP_CODE && newDataObject.PRIMARY_CONTACT_ZIP_CODE !== 'null') {
                        sfLldb[i_upd].PRIMARY_CONTACT_ZIP_CODE = newDataObject.PRIMARY_CONTACT_ZIP_CODE
                    }
        
                    // TODO: do i need to add ids???
        
        
        
                    toUpdate.push(sfLldb[i_upd])
                    haveBeenProcessed.set(key, sfLldb[i_upd])
                }
            }
        
            for (var i_crt = 0; i_crt < rawLldb.length; i_crt++) {
                const newKey = '\'' + rawLldb[i_crt].REONOMY_ID + rawLldb[i_crt].CCD_ID + '\''
                if (!haveBeenProcessed.has(newKey)) {
                    toCreate.push(rawLldb[i_crt])
                }
            }
        
            // check final arrays
            console.log('to update = ', toUpdate)
            console.log('to create = ', toCreate.length)
            getsPushedIntoSF = [...toUpdate, ...toCreate]
            console.log('total count = ', getsPushedIntoSF.length)
        
        
        
            // Here I save data into lldb sql FINAL table
            // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        
            if (getsPushedIntoSF.length !== 0) {
                let finalValueString = ''
                for (var final_i = 0; final_i < getsPushedIntoSF.length; final_i++) {
                    finalValueString += '('
                        + '\'' + getsPushedIntoSF[final_i].Owner_ID + '\'' + ', '                       // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].Tenant_Name?.replaceAll('\'', '`') + '\'' + ', '                    // nvarchar(50)
                        + getsPushedIntoSF[final_i].STUDENT_COUNT + ', '                                // int
                        + getsPushedIntoSF[final_i].ESTIMATED_REVENUE_PER_STUDENT + ', '                // decimal(18,2)
                        + '\'' + getsPushedIntoSF[final_i].PROPERTY_ADDRESS_STREET?.replaceAll('\'', '`') + '\'' + ', '        // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PROPERTY_ADDRESS_CITY?.replace('\'', '`') + '\'' + ', '          // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PROPERTY_ADDRESS_STATE + '\'' + ', '         // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PROPERTY_ADDRESS_ZIP_CODE + '\'' + ', '      // nvarchar(50)
                        + getsPushedIntoSF[final_i].GROSS_BUILDING_AREA + ', '                          // decimal(18,2)
                        + '\'' + getsPushedIntoSF[final_i].MSA + '\'' + ', '                            // nvarchar(50)
                        + getsPushedIntoSF[final_i].MARKET_CAP_RATE + ', '                              // decimal(18,2)
                        + getsPushedIntoSF[final_i].MARKET_SALE_PRICE_PER_SF + ', '                     // decimal(18,2)
                        + '\'' + getsPushedIntoSF[final_i].VALUATION_METHOD + '\'' + ', '               // nvarchar(50)
                        + getsPushedIntoSF[final_i].CSC_SALE_PRICE_PER_SF_DISCOUNT + ', '               // decimal(18,2)
                        + getsPushedIntoSF[final_i].CSC_CAP_RATE_PREMIUM + ', '                         // decimal(18,2)
                        + getsPushedIntoSF[final_i].RENT_TO_REVENUE_FLAT_ASSUMPTION + ', '              // decimal(18,2)
                        + '\'' + getsPushedIntoSF[final_i].Account_ID + '\'' + ', '                     // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].Industry + '\'' + ', '                       // nvarchar(50)
                        + getsPushedIntoSF[final_i].LLDB_Date_Added + ', '                              // date
                        + getsPushedIntoSF[final_i].LLDB_Last_Updated + ', '                            // date
                        + '\'' + getsPushedIntoSF[final_i].Currently_Assigned_Broker + '\'' + ', '      // nvarchar(50) <-- change to Id??
                        + '\'' + getsPushedIntoSF[final_i].PRIMARY_CONTACT_FIRST_NAME + '\'' + ', '     // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PRIMARY_CONTACT_LAST_NAME + '\'' + ', '      // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PRIMARY_CONTACT_TITLE?.replace('\'', '`') + '\'' + ', '          // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PRIMARY_CONTACT_PHONE + '\'' + ', '          // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PRIMARY_CONTACT_EMAIL + '\'' + ', '          // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PRIMARY_CONTACT_ADDRESS + '\'' + ', '        // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PRIMARY_CONTACT_CITY + '\'' + ', '           // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PRIMARY_CONTACT_STATE + '\'' + ', '          // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].PRIMARY_CONTACT_ZIP_CODE + '\'' + ', '       // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].CONTACT_RECORD_TYPE_ID + '\'' + ', '         // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].TENANT_RECORD_TYPE_ID + '\'' + ', '          // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].ACCOUNT_RECORD_TYPE_ID + '\'' + ', '         // nvarchar(50)
                        + '\'' + getsPushedIntoSF[final_i].REONOMY_ID + '\'' + ', '                     // nvarchar(50)
                        + getsPushedIntoSF[final_i].CCD_ID + ', '                                             // int
                        + '\'' + getsPushedIntoSF[final_i].Account_Name + '\''
                        + '),'
                }
                finalValueString = finalValueString.substring(0, finalValueString.length - 1)




                // delete
                    // get the LLDB json file saved
    let containerName = 'charter-lldb'
    let blobName = 'charter-lldb/data.json'
    let streamLength = finalValueString.length // string length, not the array length
    let queryString = 'INSERT charter_lldb_final (Owner_ID, Tenant_Name, STUDENT_COUNT, ESTIMATED_REVENUE_PER_STUDENT, PROPERTY_ADDRESS_STREET, PROPERTY_ADDRESS_CITY, PROPERTY_ADDRESS_STATE, PROPERTY_ADDRESS_ZIP_CODE, GROSS_BUILDING_AREA, MSA, MARKET_CAP_RATE, MARKET_SALE_PRICE_PER_SF, VALUATION_METHOD, CSC_SALE_PRICE_PER_SF_DISCOUNT, CSC_CAP_RATE_PREMIUM, RENT_TO_REVENUE_FLAT_ASSUMPTION, Account_ID, Industry, LLDB_Date_Added, LLDB_Last_Updated, Currently_Assigned_Broker, PRIMARY_CONTACT_FIRST_NAME, PRIMARY_CONTACT_LAST_NAME, PRIMARY_CONTACT_TITLE, PRIMARY_CONTACT_PHONE, PRIMARY_CONTACT_EMAIL, PRIMARY_CONTACT_ADDRESS, PRIMARY_CONTACT_CITY, PRIMARY_CONTACT_STATE, PRIMARY_CONTACT_ZIP_CODE, CONTACT_RECORD_TYPE_ID, TENANT_RECORD_TYPE_ID, ACCOUNT_RECORD_TYPE_ID, REONOMY_ID, CCD_ID, Account_Name) SELECT * FROM (VALUES ' + finalValueString + ') AS temp (Owner_ID, Tenant_Name, STUDENT_COUNT, ESTIMATED_REVENUE_PER_STUDENT, PROPERTY_ADDRESS_STREET, PROPERTY_ADDRESS_CITY, PROPERTY_ADDRESS_STATE, PROPERTY_ADDRESS_ZIP_CODE, GROSS_BUILDING_AREA, MSA, MARKET_CAP_RATE, MARKET_SALE_PRICE_PER_SF, VALUATION_METHOD, CSC_SALE_PRICE_PER_SF_DISCOUNT, CSC_CAP_RATE_PREMIUM, RENT_TO_REVENUE_FLAT_ASSUMPTION, Account_ID, Industry, LLDB_Date_Added, LLDB_Last_Updated, Currently_Assigned_Broker, PRIMARY_CONTACT_FIRST_NAME, PRIMARY_CONTACT_LAST_NAME, PRIMARY_CONTACT_TITLE, PRIMARY_CONTACT_PHONE, PRIMARY_CONTACT_EMAIL, PRIMARY_CONTACT_ADDRESS, PRIMARY_CONTACT_CITY, PRIMARY_CONTACT_STATE, PRIMARY_CONTACT_ZIP_CODE, CONTACT_RECORD_TYPE_ID, TENANT_RECORD_TYPE_ID, ACCOUNT_RECORD_TYPE_ID, REONOMY_ID, CCD_ID, Account_Name)'
    let stream = getStream(queryString)

    blobService.createBlockBlobFromStream(
        containerName,
        blobName,
        stream,
        streamLength,
        (err) => {
            if (!err) {
                res.send({
                    message: 'LLDB json data have been saved.'
                })
            } else {
                res.send({
                    message: 'ERROR: Something went wrong.'
                })
            }
        }
    )
                // delete













        
                // Db.insertFinalLLDB(finalValueString)
            }

        } else {
            res.render('index', {
                serverResponse: 'Error. There is no data to process. Ensure you have CCD, Reonomy, Enrollment, and CoStar data in the system.',
                ccdLastUpdate: await lu.getCcdLastUpdatedDate(),
                enrLastUpdate: await lu.getEnrLastUpdatedDate(),
                reonomyLastUpdate: await lu.getReonomyLastUpdatedDate(),
                coStarLastUpdate: await lu.getCoStarLastUpdatedDate(),
                ccdPipeStatus: 'No status',
                ccdEnrPipeStatus: 'No status',
                reonomyPipeStatus: 'No status',
                stFundPipeStatus: 'No Status',
                coStarPipeStatus: 'No Status'
            })
        }

    }

    res.render('index', {
        serverResponse: 'Success. Data from csv and Salesforce have been processed and Master LLDB table compiled.',
        ccdLastUpdate: await lu.getCcdLastUpdatedDate(),
        enrLastUpdate: await lu.getEnrLastUpdatedDate(),
        reonomyLastUpdate: await lu.getReonomyLastUpdatedDate(),
        coStarLastUpdate: await lu.getCoStarLastUpdatedDate(),
        ccdPipeStatus: 'No status',
        ccdEnrPipeStatus: 'No status',
        reonomyPipeStatus: 'No status',
        stFundPipeStatus: 'No Status',
        coStarPipeStatus: 'No Status'
    })
})

// DOESN't need res.render
// get lldb that was made out of raw data
app.get('/getlldb', async function (req, res) {
    await Db.getLLDBData()
        .then((data) => {
            var myData = data[0]
            converter.json2csv(myData)
                .then((csv) => {
                    // console.log('csv = ', csv)
                    //this statement tells the browser what type of data is supposed to download and force it to download
                    res.writeHead(200, {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename=lldb_export.csv'
                    });
                    // whereas this part is in charge of telling what data should be parsed and be downloaded
                    res.end(csv, "binary");
                })
        })

})

// DOESN't need res.render
// get lldb that was made out of salesforce data
app.get('/getsalesforcelldb', async function (req, res) {
    await Db.getSalesforceLLDBData()
        .then((data) => {
            var myData = data[0]
            converter.json2csv(myData)
                .then((csv) => {
                    // console.log('csv = ', csv)
                    //this statement tells the browser what type of data is supposed to download and force it to download
                    res.writeHead(200, {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename=salesforce_lldb_export.csv'
                    });
                    // whereas this part is in charge of telling what data should be parsed and be downloaded
                    res.end(csv, "binary");
                })
        })

})




// File upload
// TODO: make one POST per form, rater than all in one
app.post('/postfile',
    fileUpload({ createParentPath: true }),
    (req, res) => {

        const files = req.files

        if (!req.files) {
            res.render('index', {
                serverResponse: 'Error. No files attached. Attach csv and try again.',
                ccdLastUpdate: 'No data',
                enrLastUpdate: 'No data',
                reonomyLastUpdate: 'No data',
                coStarLastUpdate: 'No data',
                ccdPipeStatus: 'No status',
                ccdEnrPipeStatus: 'No Status',
                reonomyPipeStatus: 'No status',
                stFundPipeStatus: 'No Status',
                coStarPipeStatus: 'No Status'
            })
        } else {
            const rawBlobName = files.file.name

            let containerName
            let stream
            let streamLength

            if (rawBlobName == 'ccd_sch.csv') {
                containerName = 'ccd'
                blobName = 'ccd/' + rawBlobName
                streamLength = files.file.size
                stream = getStream(files.file.data)
            }
            if (rawBlobName == 'reonomy.csv') {
                containerName = 'reonomy'
                blobName = 'reonomy/' + rawBlobName
                streamLength = files.file.size
                stream = getStream(files.file.data)
            }
            if (rawBlobName == 'ccd-enrollment.csv') {
                containerName = 'ccd-enrollment'
                blobName = 'ccd-enrollment/' + rawBlobName
                streamLength = files.file.size
                stream = getStream(files.file.data)
            }
            if (rawBlobName == 'costar.csv') {
                containerName = 'costar'
                blobName = 'costar/' + rawBlobName
                streamLength = files.file.size
                stream = getStream(files.file.data)
            }

            console.log(containerName)
            console.log(rawBlobName)
            console.log(blobName)

            blobService.createBlockBlobFromStream(
                containerName,
                blobName,
                stream,
                streamLength,
                (err) => {
                    if (!err) {
                        if (rawBlobName == 'ccd_sch.csv') {

                            res.render('index', {
                                serverResponse: 'Success. CCD data file ccd.csv has been submitted',
                                ccdLastUpdate: 'No data',
                                enrLastUpdate: 'No data',
                                reonomyLastUpdate: 'No data',
                                coStarLastUpdate: 'No data',
                                ccdPipeStatus: 'In Progress',
                                ccdEnrPipeStatus: 'No status',
                                reonomyPipeStatus: 'No status',
                                stFundPipeStatus: 'No Status',
                                coStarPipeStatus: 'No Status'
                            })
                        }
                        if (rawBlobName == 'reonomy.csv') {

                            res.render('index', {
                                serverResponse: 'Success. Reonomy data file reonomy.csv has been submitted',
                                ccdLastUpdate: 'No data',
                                enrLastUpdate: 'No data',
                                reonomyLastUpdate: 'No data',
                                coStarLastUpdate: 'No data',
                                ccdPipeStatus: 'No status',
                                ccdEnrPipeStatus: 'No status',
                                reonomyPipeStatus: 'In Progress',
                                stFundPipeStatus: 'No Status',
                                coStarPipeStatus: 'No Status'
                            })
                        }
                        if (rawBlobName == 'ccd-enrollment.csv') {

                            res.render('index', {
                                serverResponse: 'Success. Enrollment data file ccd-enrollment.csv has been submitted',
                                ccdLastUpdate: 'No data',
                                enrLastUpdate: 'No data',
                                reonomyLastUpdate: 'No data',
                                coStarLastUpdate: 'No data',
                                ccdPipeStatus: 'No status',
                                ccdEnrPipeStatus: 'In Progress',
                                reonomyPipeStatus: 'No status',
                                stFundPipeStatus: 'No Status',
                                coStarPipeStatus: 'No Status'
                            })
                        }
                        if (rawBlobName == 'costar.csv') {

                            res.render('index', {
                                serverResponse: 'Success. CoStar data file costar.csv has been submitted',
                                ccdLastUpdate: 'No data',
                                enrLastUpdate: 'No data',
                                reonomyLastUpdate: 'No data',
                                coStarLastUpdate: 'No data',
                                ccdPipeStatus: 'No status',
                                ccdEnrPipeStatus: 'No Status',
                                reonomyPipeStatus: 'No status',
                                stFundPipeStatus: 'No Status',
                                coStarPipeStatus: 'In Progress'
                            })
                        }

                    } else {

                        res.render('index', {
                            serverResponse: 'Error. Something went wrong. Ensure files named correctly and data type in CSV is general.',
                            ccdLastUpdate: 'No data',
                            enrLastUpdate: 'No data',
                            reonomyLastUpdate: 'No data',
                            coStarLastUpdate: 'No data',
                            ccdPipeStatus: 'No status',
                            ccdEnrPipeStatus: 'No Status',
                            reonomyPipeStatus: 'No status',
                            stFundPipeStatus: 'No Status',
                            coStarPipeStatus: 'No Status'
                        })
                    }
                }
            )
        }


    })


// manually updated
app.post('/add', async (req, res) => {

    // IMPORTANT
    // you need to use(express.urlencoded({extended: true})) and use(expres.json) before you can access req.body
    const enteredData = req.body
    console.log(enteredData)

    if (enteredData.state !== 'selectstate') {
        if (enteredData.revenue !== '' || enteredData.cscpremium !== '' || enteredData.flatrentassum !== '' || enteredData.psfdiscount !== '') {
            let setString = ' SET '

            if (enteredData.revenue !== '') {
                setString += ' ESTIMATED_REVENUE_PER_STUDENT = ' + enteredData.revenue
            }
            if (enteredData.cscpremium !== '') {
                setString += ', CSC_CAP_RATE_PREMIUM = ' + enteredData.cscpremium
            }
            if (enteredData.flatrentassum !== '') {
                setString += ', RENT_TO_REVENUE_FLAT_ASSUMPTION = ' + enteredData.flatrentassum
            }
            if (enteredData.psfdiscount !== '') {
                setString += ', CSC_SALE_PRICE_PER_SF_DISCOUNT = ' + enteredData.psfdiscount
            }

            console.log('setString ----->', setString)
            Db.insertLLDBman(enteredData.state, setString)

            res.render('index', {
                serverResponse: 'Success. LLDB table has been updated with the data you entered.',
                ccdLastUpdate: await lu.getCcdLastUpdatedDate(),
                enrLastUpdate: await lu.getEnrLastUpdatedDate(),
                reonomyLastUpdate: await lu.getReonomyLastUpdatedDate(),
                coStarLastUpdate: await lu.getCoStarLastUpdatedDate(),
                ccdPipeStatus: 'No status',
                ccdEnrPipeStatus: 'No Status',
                reonomyPipeStatus: 'No status',
                stFundPipeStatus: 'No Status',
                coStarPipeStatus: 'No Status'
            })

        } else {
            console.log('No values have been entered')

            res.render('index', {
                serverResponse: 'Error. Please enter values below.',
                ccdLastUpdate: await lu.getCcdLastUpdatedDate(),
                enrLastUpdate: await lu.getEnrLastUpdatedDate(),
                reonomyLastUpdate: await lu.getReonomyLastUpdatedDate(),
                coStarLastUpdate: await lu.getCoStarLastUpdatedDate(),
                ccdPipeStatus: 'No status',
                ccdEnrPipeStatus: 'No Status',
                reonomyPipeStatus: 'No status',
                stFundPipeStatus: 'No Status',
                coStarPipeStatus: 'No Status'
            })
        }

    } else {
        console.log('State has not been selected')

        res.render('index', {
            serverResponse: 'Error. State has not been selected. Please choose state below.',
            ccdLastUpdate: await lu.getCcdLastUpdatedDate(),
            enrLastUpdate: await lu.getEnrLastUpdatedDate(),
            reonomyLastUpdate: await lu.getReonomyLastUpdatedDate(),
            coStarLastUpdate: await lu.getCoStarLastUpdatedDate(),
            ccdPipeStatus: 'No status',
            ccdEnrPipeStatus: 'No Status',
            reonomyPipeStatus: 'No status',
            stFundPipeStatus: 'No Status',
            coStarPipeStatus: 'No Status'
        })
    }
})



// push salesforce data into sql
// from salesforce send api call to this endpoint
// dont need req.render
app.post('/postsfdata', async function (req, res) {

    const sfData = req.body
    console.log(sfData.length)
    console.log(sfData)

    let valueString = ''
    for (var i = 0; i < sfData.length; i++) {
        let item = sfData[i]
        valueString += '('
            + '\'' + item.Owner_ID + '\'' + ', '
            + '\'' + item.Tenant_Name + '\'' + ', '
            + item.STUDENT_COUNT + ', '
            + item.ESTIMATED_REVENUE_PER_STUDENT + ', '
            + '\'' + item.PROPERTY_ADDRESS_STREET + '\'' + ', '
            + '\'' + item.PROPERTY_ADDRESS_CITY + '\'' + ', '
            + '\'' + item.PROPERTY_ADDRESS_STATE + '\'' + ', '
            + '\'' + item.PROPERTY_ADDRESS_ZIP_CODE + '\'' + ', '
            + item.GROSS_BUILDING_AREA + ', '
            + '\'' + item.MSA + '\'' + ', '
            + item.MARKET_CAP_RATE + ', '
            + item.MARKET_SALE_PRICE_PER_SF + ', '
            + '\'' + item.VALUATION_METHOD + '\'' + ', '
            + item.CSC_SALE_PRICE_PER_SF_DISCOUNT + ', '
            + item.CSC_CAP_RATE_PREMIUM + ', '
            + item.RENT_TO_REVENUE_FLAT_ASSUMPTION + ', '
            + '\'' + item.Account_ID + '\'' + ', '
            + '\'' + item.Industry + '\'' + ', '
            + item.LLDB_Date_Added + ', '
            + item.LLDB_Last_Updated + ', '
            + '\'' + item.Currently_Assigned_Broker + '\'' + ', '
            + '\'' + item.PRIMARY_CONTACT_FIRST_NAME + '\'' + ', '
            + '\'' + item.PRIMARY_CONTACT_LAST_NAME + '\'' + ', '
            + '\'' + item.PRIMARY_CONTACT_TITLE?.replace('\'', '`') + '\'' + ', '
            + '\'' + item.PRIMARY_CONTACT_PHONE + '\'' + ', '
            + '\'' + item.PRIMARY_CONTACT_EMAIL + '\'' + ', '
            + '\'' + item.PRIMARY_CONTACT_ADDRESS + '\'' + ', '
            + '\'' + item.PRIMARY_CONTACT_CITY + '\'' + ', '
            + '\'' + item.PRIMARY_CONTACT_STATE + '\'' + ', '
            + '\'' + item.PRIMARY_CONTACT_ZIP_CODE + '\'' + ', '
            + '\'' + item.CONTACT_RECORD_TYPE_ID + '\'' + ', '
            + '\'' + item.TENANT_RECORD_TYPE_ID + '\'' + ', '
            + '\'' + item.ACCOUNT_RECORD_TYPE_ID + '\'' + ', '
            + '\'' + item.REONOMY_ID + '\'' + ', '
            + item.CCD_ID + ', '
            + '\'' + item.Account_Name + '\''
            + '),'
    }

    valueString = valueString.substring(0, valueString.length - 1)
    console.log(valueString)
    Db.insertTestData(valueString)

    // return to user
    res.send({
        message: req.body
    })
})


app.listen(PORT, HOST, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})