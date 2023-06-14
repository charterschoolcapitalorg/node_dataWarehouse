/** Download contents as a file
 * Source: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
 */
var fs = require('fs')

function downloadBlob(content, filename) {
    console.log(content)
    console.log(filename)
    fs.writeFile(filename, content, err => {
        if (err) throw err
        console.log('The file has been saved!')
    });
}

module.exports = {
    downloadBlob: downloadBlob,
}