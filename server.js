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

// View Engine Setup
const path = require('path')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const blobService = azure.createBlobService('DefaultEndpointsProtocol=https;AccountName=cscdwfileupload;AccountKey=RlreQ0k6PR39bPVw5aEsjvk3LnIFBQXfmixD9sMBlYL+I2LcMlMveb/L6YT5a7gg6+FqMFsYMsyP+AStNiTApQ==;EndpointSuffix=core.windows.net')

app.use(express.static('page'))

app.get('/', function(req, res){
    res.render('index', {
        successMessageCCD: '',
        successMessageReonomy: '',
        successMessageCCDEnrollment: '',
        errorMessage: ''
    })
})

app.post('/postfile',
    fileUpload({ createParentPath: true }),
    (req, res) => {
        
        const files = req.files
        const rawBlobName = files.file.name
        
        let containerName
        let stream
        let streamLength
        let successMessage
        let errorMessage

        if(rawBlobName == 'ccd_sch.csv') {
            console.log('===================== I AM CCD DATA')
            containerName = 'ccd'
            blobName = 'ccd/' + rawBlobName
            streamLength = files.file.size
            stream = getStream(files.file.data)
            successMessage = '... ccd processing'
        }
        if(rawBlobName == 'reonomy.csv') {
            console.log('===================== I AM REONOMY DATA')
            containerName = 'reonomy'
            blobName = 'reonomy/' + rawBlobName
            streamLength = files.file.size
            stream = getStream(files.file.data)
            successMessage = '... reonomy processing'
        }
        if(rawBlobName == 'ccd_enrollment.csv') {
            console.log('===================== I AM CCD ENROLLMENT DATA')
            containerName = 'ccd-enrollment'
            blobName = 'ccd-enrollment/' + rawBlobName
            streamLength = files.file.size
            stream = getStream(files.file.data)
            successMessage = '... ccd-enrollment processing'
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
                if(!err) {
                    if(rawBlobName == 'ccd_sch.csv') {
                        res.render("index", { 
                            successMessageCCD: successMessage,
                            successMessageReonomy: '',
                            successMessageCCDEnrollment: ''
                        })
                    }
                    if(rawBlobName == 'reonomy.csv') {
                        res.render("index", { 
                            successMessageCCD: '',
                            successMessageReonomy: successMessage,
                            successMessageCCDEnrollment: ''
                        })
                    }
                    if(rawBlobName == 'ccd-enrollment.csv') {
                        res.render("index", { 
                            successMessageCCD: '',
                            successMessageReonomy: '',
                            successMessageCCDEnrollment: successMessage
                        })
                    }
                    
                } else {
                    res.render("index", { errorMessage: "ERROR: Something went wrong." })
                }
            }
        )
    })



app.listen(PORT, HOST, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})