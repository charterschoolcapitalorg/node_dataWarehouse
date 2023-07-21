// check on pipeline status

const https = require('https');
const { DataFactoryManagementClient } = require("@azure/arm-datafactory");
const { DefaultAzureCredential } = require("@azure/identity");

// get lldb data
async function azurePipelineStatus() {

    let pool = await sql.connect(config)

    https.get('https://example.com/api/endpoint', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(JSON.parse(data).explanation);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

module.exports = {
    azurePipelineStatus: azurePipelineStatus,
}



