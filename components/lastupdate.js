var Db = require('./dboperations')

// Last update functions
// CCD
async function getCcdLastUpdatedDate() {
    let ccdLastUpdate
    await Db.getCcdData()
        .then((ccdData) => {
            ccdDataArray = ccdData[0]
        })

    console.log('ccdDataArray[0].LAST_UPDATE', ccdDataArray[0].LAST_UPDATE)
    if(ccdDataArray[0].LAST_UPDATE !== null) {
        let date = new Date(ccdDataArray[0].LAST_UPDATE)
        ccdLastUpdate = date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear()
    } else {
        ccdLastUpdate = 'No data'
    }

    return ccdLastUpdate
}

// Enrollment
async function getEnrLastUpdatedDate() {
    let ccdEnrLastUpdate
    await Db.getCddEnrollmentData()
        .then((ccdEnrData) => {
            ccdEnrDataArray = ccdEnrData[0]
        })

    console.log('ccdEnrDataArray[0].LAST_UPDATE', ccdEnrDataArray[0].LAST_UPDATE)
    if(ccdEnrDataArray[0].LAST_UPDATE !== null) {
        let date = new Date(ccdEnrDataArray[0].LAST_UPDATE)
        ccdEnrLastUpdate = date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear()
    } else {
        ccdEnrLastUpdate = 'No data'
    }

    return ccdEnrLastUpdate
}

// Reonomy
async function getReonomyLastUpdatedDate() {
    let reonomyLastUpdate
    await Db.getReonomyData()
        .then((reonomyData) => {
            reonomyDataArray = reonomyData[0]
        })

    console.log('reonomyDataArray[0].LAST_UPDATE', reonomyDataArray[0].LAST_UPDATE)
    if(reonomyDataArray[0].LAST_UPDATE !== null) {
        let date = new Date(reonomyDataArray[0].LAST_UPDATE)
        reonomyLastUpdate = date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear()
    } else {
        reonomyLastUpdate = 'No data'
    }

    return reonomyLastUpdate
}

// CoStar
async function getCoStarLastUpdatedDate() {
    let coStarLastUpdate
    await Db.getCostarData()
        .then((costarData) => {
            costarDataArray = costarData[0]
        })

    console.log('costarDataArray[0].LAST_UPDATE', costarDataArray[0].LAST_UPDATE)
    if(costarDataArray[0].LAST_UPDATE !== null) {
        let date = new Date(costarDataArray[0].LAST_UPDATE)
        coStarLastUpdate = date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear()
    } else {
        coStarLastUpdate = 'No data'
    }

    return coStarLastUpdate
} 


module.exports = {
    getCcdLastUpdatedDate: getCcdLastUpdatedDate,
    getEnrLastUpdatedDate: getEnrLastUpdatedDate,
    getReonomyLastUpdatedDate: getReonomyLastUpdatedDate,
    getCoStarLastUpdatedDate: getCoStarLastUpdatedDate
}