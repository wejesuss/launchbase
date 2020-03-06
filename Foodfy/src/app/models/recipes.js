const db = require('../../config/db')

module.exports = {
    findByLimit(params) {
        const { limit, callback } = params
        db.query(`SELECT recipes.*, chefs.name as chef_name
        FROM recipes
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        ORDER BY created_at DESC LIMIT ${limit}`, function(err, results) {
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
    create(data) {
        try {
            const arrayOfBrokenLines = data.information.split("\r\n")
            const stringWithLineBreaksTag = arrayOfBrokenLines.join('<br>')
            if (stringWithLineBreaksTag) {
                data.information = stringWithLineBreaksTag
            }

            const query = `INSERT INTO recipes (
                title,
                chef_id,
                ingredients,
                preparation,
                information
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `
            const values = [
                data.title,
                data.chef_id,
                data.ingredients,
                data.preparation,
                data.information
            ]

            return db.query(query, values)
        } catch (err) {
            console.error(err)
        }
    },
    recipeSelectOptions() {
        try {
            return db.query(`SELECT chefs.name, chefs.id FROM chefs`)
        } catch (err) {
            console.error(err)
        }
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
            ingredients = ($3),
            preparation = ($4),
            information = ($5)
        WHERE id = $6
        `

        const values = [
            data.title,
            data.chef_id,
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
            orderBy = `ORDER BY created_at DESC`,
            filterQuery = "",
            totalQuery = `(
                SELECT count(*) FROM recipes
            ) AS total`

        if(filter) {
            orderBy = `ORDER BY updated_at DESC`
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
        ${orderBy} LIMIT $1 OFFSET $2
        `
        
        db.query(query, [limit, offset], function(err, results) {
            if(err) throw `Database error! ${err}`

            callback(results.rows)
        })
    }
}