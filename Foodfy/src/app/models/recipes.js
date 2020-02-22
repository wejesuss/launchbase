const db = require('../../config/db')
const { date } = require('../../utils/utils')

module.exports = {
    all(params) {
        const { limit, offset, callback } = params

        let query = "",
            totalQuery = `(
                SELECT count(*) FROM recipes
            ) AS total`

        query = `SELECT recipes.*, ${totalQuery}, chefs.name as chef_name
        FROM recipes
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        ORDER BY recipes.id ASC LIMIT $1 OFFSET $2
        `
        
        db.query(query, [limit, offset], function(err, results) {
            if(err) throw `Database error! ${err}`

            callback(results.rows)
        })
    },
    findByLimit(params) {
        const { limit, callback } = params
        db.query(`SELECT recipes.*, chefs.name as chef_name
        FROM recipes
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        ORDER BY id ASC LIMIT ${limit}`, function(err, results) {
            if(err) throw `Database error! ${err}`
            
            callback(results.rows)
        })
    },
    find(params) {
        const { id, callback } = params
        db.query(`SELECT recipes.*, chefs.name as chef_name
        FROM recipes
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        WHERE recipes.id = ${id}`, function(err, results) {
            if(err) throw `Database error! ${err}`

            callback(results.rows[0])
        })
    },
    create(data, callback) {
        const arrayOfBrokenLines = data.information.split("\r\n")
        const stringWithLineBreaksTag = arrayOfBrokenLines.join('<br>')
        if (stringWithLineBreaksTag) {
            data.information = stringWithLineBreaksTag
        }

        const query = `INSERT INTO recipes (
            title,
            chef_id,
            image,
            ingredients,
            preparation,
            information,
            created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        `
        const values = [
            data.title,
            data.chef_id,
            data.image,
            data.ingredients,
            data.preparation,
            data.information,
            date(Date.now()).iso
        ]

        db.query(query, values, (err, results) => {
            if (err) throw `Database error! ${err}`

            callback(results.rows[0])
        })
    },
    recipeSelectOptions(callback) {
        db.query(`SELECT chefs.name, chefs.id FROM chefs`, function(err, results) {
            if (err) throw `Database error! ${err}`

            callback(results.rows)
        })
    },
    update(data, callback) {
        const arrayOfBrokenLines = data.information.split("\r\n")
        const stringWithLineBreaksTag = arrayOfBrokenLines.join('<br>')
        if (stringWithLineBreaksTag) {
            data.information = stringWithLineBreaksTag
        }

        const query = `
        UPDATE recipes SET
            title = ($1),
            chef_id = ($2),
            image = ($3),
            ingredients = ($4),
            preparation = ($5),
            information = ($6)
        WHERE id = $7
        `

        const values = [
            data.title,
            data.chef_id,
            data.image,
            data.ingredients,
            data.preparation,
            data.information,
            data.id
        ]

        db.query(query, values, function (err, results) {
            if (err) throw `Database error! ${err}`

            callback()
        })
    },
    delete(id, callback) {
        db.query(`DELETE FROM recipes WHERE id = $1`, [id], function (err, results) {
            if (err) throw `Database error! ${err}`

            callback()
        })
    },
    paginate(params) {
        const { filter, limit, offset, callback } = params

        let query = "",
            filterQuery = "",
            totalQuery = `(
                SELECT count(*) FROM recipes
            ) AS total`

        if(filter) {
            filterQuery = `
            WHERE recipes.title ILIKE '%${filter}%'
            `
            totalQuery = `(
                SELECT count(*) FROM recipes
                ${filterQuery}
            ) AS total`
        }

        query = `SELECT recipes.*, ${totalQuery}, chefs.name as chef_name
        FROM recipes
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        ${filterQuery}
        ORDER BY recipes.id ASC LIMIT $1 OFFSET $2
        `
        
        db.query(query, [limit, offset], function(err, results) {
            if(err) throw `Database error! ${err}`

            callback(results.rows)
        })
    }
}