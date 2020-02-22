const db = require('../../config/db')
const { date } = require('../../utils/utils')

module.exports = {
    all(callback) {
        db.query(`SELECT chefs.*, count(recipes) AS total_recipes
        FROM chefs
        LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
        GROUP BY chefs.id
        ORDER BY total_recipes DESC`, function(err, results) {
            if (err) throw `Database error! ${err}`
            
            callback(results.rows)
        })
    },
    create(data, callback) {
        const query = `
            INSERT INTO chefs (
                name,
                avatar_url,
                created_at
            ) VALUES ($1, $2, $3)
            RETURNING id
        `
        const values = [
            data.name,
            data.avatar_url,
            date(Date.now()).iso
        ]

        db.query(query, values, (err, results) => {
            if (err) throw `Database error! ${err}`

            callback(results.rows[0])
        })
    },
    find(params) {
        const { id, callback } = params
        db.query(`SELECT chefs.*, count(recipes) AS total_recipes
        FROM chefs
        LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
        WHERE chefs.id = ${id}
        GROUP BY chefs.id`, function(err, results) {
            if(err) throw `Database error! ${err}`

            callback(results.rows[0])
        })
    },
    selectRecipesById(id, callback) {

        db.query(`SELECT recipes.*, chefs.name as chef_name
        FROM recipes
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        WHERE chefs.id = ${id}
        ORDER BY recipes.id ASC`, function(err, results) {
            if(err) throw `Database error! ${err}`

            callback(results.rows)
        })
    },
    update(data, callback) {
        const query = `
        UPDATE chefs SET
            name = ($1),
            avatar_url = ($2)
        WHERE id = $3
        `

        const values = [
            data.name,
            data.avatar_url,
            data.id
        ]

        db.query(query, values, function (err, results) {
            if (err) throw `Database error! ${err}`

            callback()
        })
    },
    delete(id, callback) {
        db.query(`DELETE FROM chefs WHERE id = $1`, [id], function (err, results) {
            if (err) throw `Database error! ${err}`

            callback()
        })
    }
}