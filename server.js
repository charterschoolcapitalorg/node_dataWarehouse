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
const fs = require('fs')
let converter = require('json-2-csv')
// View Engine Setup
const path = require('path')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
const blobService = azure.createBlobService('DefaultEndpointsProtocol=https;AccountName=cscdwfileupload;AccountKey=RlreQ0k6PR39bPVw5aEsjvk3LnIFBQXfmixD9sMBlYL+I2LcMlMveb/L6YT5a7gg6+FqMFsYMsyP+AStNiTApQ==;EndpointSuffix=core.windows.net')
app.use(express.static('page'))

// alerts 
// var popup = require('popups')
let alert = require('alert')

// to read form values
// app.use(express.bodyParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))





// when the page first load or reload
// TODO: add LOADING spin
app.get('/', async function (req, res) {

    console.log('@@@ main screen reload')


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

        // check dates
        console.log('ccd new = ', ccdNewDate.toString())
        console.log('ccd old = ', ccdOldDate.toString())
        console.log('ccd enr new = ', ccdenrNewDate.toString())
        console.log('ccd enr old = ', ccdenrOldDate.toString())
        console.log('reonomy new = ', reonomyNewDate.toString())
        console.log('reonomy old = ', reonomyOldDate.toString())
        console.log('costar new = ', costarNewDate.toString())
        console.log('costar old = ', costarOldDate.toString())

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

        for (var ccd_i = 0; ccd_i < ccdDataArray.length; ccd_i++) {
            var ccd_obj = ccdDataArray[ccd_i]
            // console.log('------->', ccd_obj.STATENAME)
            var lldbItem = {
                Owner_ID: null,
                Tenant_Name: ccd_obj.SCH_NAME,
                STUDENT_COUNT: null,
                ESTIMATED_REVENUE_PER_STUDENT: null,
                PROPERTY_ADDRESS_STREET: null,
                PROPERTY_ADDRESS_CITY: null,
                PROPERTY_ADDRESS_STATE: null,
                PROPERTY_ADDRESS_ZIP_CODE: null,
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
                CCD_ID: ccd_obj.SCHID
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
                    lldbItem.PROPERTY_ADDRESS_STREET = reonomy_obj.address_line_1
                    lldbItem.PROPERTY_ADDRESS_CITY = reonomy_obj.address_city
                    lldbItem.PROPERTY_ADDRESS_STATE = reonomy_obj.address_state
                    lldbItem.PROPERTY_ADDRESS_ZIP_CODE = reonomy_obj.address_postal_code
                    lldbItem.GROSS_BUILDING_AREA = reonomy_obj.gross_building_area
                    lldbItem.PRIMARY_CONTACT_FIRST_NAME = reonomy_obj.contact_name
                    lldbItem.PRIMARY_CONTACT_LAST_NAME = reonomy_obj.contact_name
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

        // STEP 3 - Here I save data into lldb sql table
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        if (lldbArray.length !== 0) {
            let valueString = ''
            for (var lldb_i = 0; lldb_i < lldbArray.length; lldb_i++) {
                valueString += '('
                    + '\'' + lldbArray[lldb_i].Owner_ID + '\'' + ', '                       // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].Tenant_Name + '\'' + ', '                    // nvarchar(50)
                    + lldbArray[lldb_i].STUDENT_COUNT + ', '                                // int
                    + lldbArray[lldb_i].ESTIMATED_REVENUE_PER_STUDENT + ', '                // decimal(18,2)
                    + '\'' + lldbArray[lldb_i].PROPERTY_ADDRESS_STREET + '\'' + ', '        // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PROPERTY_ADDRESS_CITY + '\'' + ', '          // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PROPERTY_ADDRESS_STATE + '\'' + ', '         // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PROPERTY_ADDRESS_ZIP_CODE + '\'' + ', '      // nvarchar(50)
                    + lldbArray[lldb_i].GROSS_BUILDING_AREA + ', '                          // decimal(18,2)
                    + '\'' + lldbArray[lldb_i].MSA + '\'' + ', '                            // nvarchar(50)
                    + lldbArray[lldb_i].MARKET_CAP_RATE + ', '                              // decimal(18,2)
                    + lldbArray[lldb_i].MARKET_SALE_PRICE_PER_SF + ', '                     // decimal(18,2)
                    + '\'' + lldbArray[lldb_i].VALUATION_METHOD + '\'' + ', '               // nvarchar(50)
                    + lldbArray[lldb_i].CSC_SALE_PRICE_PER_SF_DISCOUNT + ', '               // decimal(18,2)
                    + lldbArray[lldb_i].CSC_CAP_RATE_PREMIUM + ', '                         // decimal(18,2)
                    + lldbArray[lldb_i].RENT_TO_REVENUE_FLAT_ASSUMPTION + ', '              // decimal(18,2)
                    + '\'' + lldbArray[lldb_i].Account_ID + '\'' + ', '                     // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].Industry + '\'' + ', '                       // nvarchar(50)
                    + lldbArray[lldb_i].LLDB_Date_Added + ', '                              // date
                    + lldbArray[lldb_i].LLDB_Last_Updated + ', '                            // date
                    + '\'' + lldbArray[lldb_i].Currently_Assigned_Broker + '\'' + ', '      // nvarchar(50) <-- change to Id??
                    + '\'' + lldbArray[lldb_i].PRIMARY_CONTACT_FIRST_NAME + '\'' + ', '     // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PRIMARY_CONTACT_LAST_NAME + '\'' + ', '      // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PRIMARY_CONTACT_TITLE?.replace('\'', '`') + '\'' + ', '          // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PRIMARY_CONTACT_PHONE + '\'' + ', '          // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PRIMARY_CONTACT_EMAIL + '\'' + ', '          // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PRIMARY_CONTACT_ADDRESS + '\'' + ', '        // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PRIMARY_CONTACT_CITY + '\'' + ', '           // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PRIMARY_CONTACT_STATE + '\'' + ', '          // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].PRIMARY_CONTACT_ZIP_CODE + '\'' + ', '       // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].CONTACT_RECORD_TYPE_ID + '\'' + ', '         // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].TENANT_RECORD_TYPE_ID + '\'' + ', '          // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].ACCOUNT_RECORD_TYPE_ID + '\'' + ', '         // nvarchar(50)
                    + '\'' + lldbArray[lldb_i].REONOMY_ID + '\'' + ', '                     // nvarchar(50)
                    + lldbArray[lldb_i].CCD_ID                                              // int
                    + '),'

            }

            valueString = valueString.substring(0, valueString.length - 1)

            // check my query string
            // console.log('------> my sql query -----> ')
            // console.log(valueString)

            Db.insertLLDB(valueString)
        }



    }









    // return this
    res.render('index', {
        successMessageCCD: '',
        successMessageReonomy: '',
        successMessageCCDEnrollment: '',
        successMessageCostar: '',
        errorMessage: '',
        successFileSave: '',
        ccdLastUpdateToDisplay: ccdNewDate.toString().substring(0, 24),
        reonomyLastUpdateToDisplay: reonomyNewDate.toString().substring(0, 24),
        costarLastUpdateToDisplay: costarNewDate.toString().substring(0, 24),
        ccdEnrLastUpdateToDisplay: ccdenrNewDate.toString().substring(0, 24),
        // array lengths
        ccdLength: ccdDataArray.length,
        ccdEnrLength: ccdEnrDataArray.length,
        reonomyLength: reonomyDataArray.length,
        costarLength: costarDataArray.length
    })
})


// get lldb
app.get('/getlldb', async function (req, res) {
    await Db.getLLDBData()
        .then((data) => {
            var myData = data[0]
            converter.json2csv(myData)
                .then((csv) => {
                    console.log('csv = ', csv)
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


// File upload
// TODO: make one POST per form, rater than all in one
app.post('/postfile',
    fileUpload({ createParentPath: true }),
    (req, res) => {

        const files = req.files

        if (!req.files) {
            res.render("index", {
                successMessageCCD: '',
                successMessageReonomy: '',
                successMessageCCDEnrollment: '',
                successMessageCostar: '',
                successFileSave: '',
                errorMessage: "ERROR: No files attached.",
                ccdLength: '',
                ccdEnrLength: '',
                reonomyLength: '',
                costarLength: '',
                ccdLastUpdateToDisplay: 'ERROR: No files attached.',
                ccdEnrLastUpdateToDisplay: 'ERROR: No files attached.',
                reonomyLastUpdateToDisplay: 'ERROR: No files attached.',
                costarLastUpdateToDisplay: 'ERROR: No files attached.',
            })
        } else {
            const rawBlobName = files.file.name

            let containerName
            let stream
            let streamLength
            let successMessage
            let errorMessage

            if (rawBlobName == 'ccd_sch.csv') {
                console.log('===================== I AM CCD DATA')
                containerName = 'ccd'
                blobName = 'ccd/' + rawBlobName
                streamLength = files.file.size
                stream = getStream(files.file.data)
                successMessage = '... ccd processing'
            }
            if (rawBlobName == 'reonomy.csv') {
                console.log('===================== I AM REONOMY DATA')
                containerName = 'reonomy'
                blobName = 'reonomy/' + rawBlobName
                streamLength = files.file.size
                stream = getStream(files.file.data)
                successMessage = '... reonomy processing'
            }
            if (rawBlobName == 'ccd-enrollment.csv') {
                console.log('===================== I AM CCD ENROLLMENT DATA')
                containerName = 'ccd-enrollment'
                blobName = 'ccd-enrollment/' + rawBlobName
                streamLength = files.file.size
                stream = getStream(files.file.data)
                successMessage = '... ccd-enrollment processing'
            }
            if (rawBlobName == 'costar.csv') {
                console.log('===================== I AM COSTAR DATA')
                containerName = 'costar'
                blobName = 'costar/' + rawBlobName
                streamLength = files.file.size
                stream = getStream(files.file.data)
                successMessage = '... costar processing'
            }

            console.log(containerName)
            console.log(rawBlobName)
            console.log(blobName)
            console.log(successMessage)

            blobService.createBlockBlobFromStream(
                containerName,
                blobName,
                stream,
                streamLength,
                (err) => {
                    if (!err) {
                        if (rawBlobName == 'ccd_sch.csv') {
                            res.render("index", {
                                successMessageCCD: successMessage,
                                successMessageReonomy: '',
                                successMessageCCDEnrollment: '',
                                successMessageCostar: '',
                                successFileSave: '',
                                errorMessage: '',
                                // last updates
                                ccdLastUpdateToDisplay: 'processing',
                                ccdEnrLastUpdateToDisplay: 'processing',
                                reonomyLastUpdateToDisplay: 'processing',
                                costarLastUpdateToDisplay: 'processing',
                                // data length
                                ccdLength: 'processing',
                                ccdEnrLength: 'processing',
                                reonomyLength: 'processing',
                                costarLength: 'processing'
                            })
                        }
                        if (rawBlobName == 'reonomy.csv') {
                            res.render("index", {
                                successMessageCCD: '',
                                successMessageReonomy: successMessage,
                                successMessageCCDEnrollment: '',
                                successMessageCostar: '',
                                successFileSave: '',
                                errorMessage: '',
                                // last updates
                                ccdLastUpdateToDisplay: 'processing',
                                ccdEnrLastUpdateToDisplay: 'processing',
                                reonomyLastUpdateToDisplay: 'processing',
                                costarLastUpdateToDisplay: 'processing',
                                // data length
                                ccdLength: 'processing',
                                ccdEnrLength: 'processing',
                                reonomyLength: 'processing',
                                costarLength: 'processing'
                            })
                        }
                        if (rawBlobName == 'ccd-enrollment.csv') {
                            res.render("index", {
                                successMessageCCD: '',
                                successMessageReonomy: '',
                                successMessageCCDEnrollment: successMessage,
                                successMessageCostar: '',
                                successFileSave: '',
                                errorMessage: '',
                                // last updates
                                ccdLastUpdateToDisplay: 'processing',
                                ccdEnrLastUpdateToDisplay: 'processing',
                                reonomyLastUpdateToDisplay: 'processing',
                                costarLastUpdateToDisplay: 'processing',
                                // data length
                                ccdLength: 'processing',
                                ccdEnrLength: 'processing',
                                reonomyLength: 'processing',
                                costarLength: 'processing'
                            })
                        }
                        if (rawBlobName == 'costar.csv') {
                            res.render("index", {
                                successMessageCCD: '',
                                successMessageReonomy: '',
                                successMessageCCDEnrollment: '',
                                successMessageCostar: successMessage,
                                successFileSave: '',
                                errorMessage: '',
                                // last updates
                                ccdLastUpdateToDisplay: 'processing',
                                ccdEnrLastUpdateToDisplay: 'processing',
                                reonomyLastUpdateToDisplay: 'processing',
                                costarLastUpdateToDisplay: 'processing',
                                // data length
                                ccdLength: 'processing',
                                ccdEnrLength: 'processing',
                                reonomyLength: 'processing',
                                costarLength: 'processing'
                            })
                        }

                    } else {
                        res.render("index", { errorMessage: "ERROR: Something went wrong." })
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

            // return to user
            res.send({
                message: 'lldb has been updated'
            })

        } else {
            // return to user
            res.send({
                message: 'Please enter values'
            })
        }

    } else {
        // return to user
        res.send({
            message: 'Please choose state'
        })
    }



})


app.listen(PORT, HOST, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})