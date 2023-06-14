const  config = {
    user:  'Slava', // sql user
    password:  'Sk^yx6440285', //sql user password
    server:  'csc-primary.database.windows.net', // if it does not work try- localhost
    database:  'Primary',
    options: {
      trustedconnection:  true,
      trustServerCertificate: true, // new
      enableArithAbort:  true,
    //   instancename:  'SQLEXPRESS'  // SQL Server instance name
    },
    port: 1433
  }
  
  module.exports = config;