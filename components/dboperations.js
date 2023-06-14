var  config = require('./dbconfig')
const  sql = require('mssql')

// query all data
async  function  getDataFromSQL() {
  try {
    let  pool = await  sql.connect(config)
    let  products = await  pool.request().query("SELECT * from testData")
    return  products.recordsets
  }
  catch (error) {
    console.log(error)
  }
}

module.exports = {
    getDataFromSQL: getDataFromSQL,
}