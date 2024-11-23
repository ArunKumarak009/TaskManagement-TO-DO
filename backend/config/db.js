const mysql = require("mysql2/promise")
const mySqlPool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'Arun@1234',
    database:'taskmanagement_db',


})

module.exports = mySqlPool