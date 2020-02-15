const db = require('../../config/db')

module.exports = {
    all(callback) {
        db.query(`SELECT * FROM recipes`, function(err, results) {
            if (err) throw `Database error! ${err}`
            callback(results.rows)
        })
    },
    findByLimit(params) {
        const { limit, callback } = params
        db.query(`SELECT * FROM recipes LIMIT ${limit}`, function(err, results) {
            if(err) throw `Database error! ${err}`
            
            callback(results.rows)
        })
    },
    find(params) {
        const { id, callback } = params
        db.query(`SELECT * FROM recipes WHERE id = ${id}`, function(err, results) {
            if(err) throw `Database error! ${err}`

            callback(results.rows[0])
        })
    }
}