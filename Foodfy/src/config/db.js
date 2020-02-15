const { Pool } = require('pg')

module.exports = new Pool({
    database : "foodfy",
    user : "postgres",
    password: "postgres",
    host : "localhost",
    port: 5432
})