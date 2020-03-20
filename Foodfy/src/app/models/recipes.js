const db = require('../../config/db')

module.exports = {
    async findByLimit(limit) {
        try {
            let results = await db.query(`SELECT recipes.*, chefs.name as chef_name
            FROM recipes
            LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
            ORDER BY created_at DESC LIMIT ${limit}`)

            return results.rows
        } catch (err) {
            console.error(err)
        }
    },
    async find(filters) {
        try {
            let query = `SELECT recipes.*, chefs.name as chef_name
            FROM recipes
            LEFT JOIN chefs ON (chefs.id = recipes.chef_id)`

            Object.keys(filters).map(key => {
                query = `${query} ${key}`
                
                Object.keys(filters[key]).map(filter => {
                    query = `${query} recipes.${filter} = '${filters[key][filter]}' `
                })
            })
            
            let results = await db.query(query)
            
            return results.rows[0]
        } catch (err) {
            console.error(err)
        }
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
                information,
                user_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            `
            const values = [
                data.title,
                data.chef_id,
                data.ingredients,
                data.preparation,
                data.information,
                data.user_id
            ]

            return db.query(query, values)
        } catch (err) {
            console.error(err)
        }
    },
    async recipeSelectOptions() {
        try {
          let results = await db.query(`SELECT chefs.name, chefs.id FROM chefs`)

          return results.rows
        } catch (err) {
            console.error(err)
        }
    },
    update(data) {
        try {
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

            return db.query(query, values)
        } catch (err) {
            console.error(err)
        }
    },
    delete(id) {
        try {
            return db.query(`DELETE FROM recipes WHERE id = $1`, [id])
        } catch (error) {
            console.error(error)
        }
    },
    async paginate(params) {
        try {
            const { filter, limit, offset, user_id } = params

            let query = "",
                orderBy = `ORDER BY created_at DESC`,
                filterQuery = "",
                limitByUser = "",
                totalQuery = `(
                SELECT count(*) FROM recipes
            ) AS total`

            if(user_id) {
                totalQuery = `(
                    SELECT count(*) FROM recipes WHERE recipes.user_id = ${user_id}
                ) AS total`

                limitByUser = `WHERE recipes.user_id = ${user_id}`
            }

            if (filter) {
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
                ${limitByUser}
                ${orderBy} LIMIT $1 OFFSET $2
            `
            let results = await db.query(query, [limit, offset])

            return results.rows
        } catch (err) {
            console.error(err)
        }
    }
}