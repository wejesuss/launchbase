const db = require('../../config/db')

module.exports = {
    all() {
        try {
            return db.query(`SELECT chefs.*, count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
            GROUP BY chefs.id
            ORDER BY total_recipes DESC`)
        } catch (err) {
            console.error(err)
        }
    },
    async create(name, file_id) {
        try {
            const query = `
            INSERT INTO chefs (
                name,
                file_id
            ) VALUES ($1, $2)
            RETURNING id`

            const values = [
                name,
                file_id
            ]
            let results = await db.query(query, values)

            return results.rows[0].id
        } catch (err) {
            console.error(err)
        }
    },
    async find(id) {
        try {
            let results = await db.query(`SELECT chefs.*, count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
            WHERE chefs.id = ${id}
            GROUP BY chefs.id`)

            return results.rows[0]
        } catch (error) {
            console.error(error)
        }
    },
    async selectRecipesById(id) {
        try {
            let results = await db.query(`SELECT recipes.*, chefs.name as chef_name
            FROM recipes
            LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
            WHERE chefs.id = ${id}
            ORDER BY recipes.created_at DESC`)   
            
            return results.rows
        } catch (err) {
            console.error(err)
        }
    },
    update(name, file_id, id) {
        try {
            const query = `
            UPDATE chefs SET
                name = ($1),
                file_id = ($2)
            WHERE id = $3
            `
            const values = [
                name,
                file_id,
                id
            ]

            return db.query(query, values)
        } catch (err) {
            console.error(err)
        }
    },
    delete(id) {
        try {
            return db.query(`DELETE FROM chefs WHERE id = $1`, [id])
        } catch (error) {
            console.error(error)
        }
    },
    async paginate(params) {
        try {
            const { limit, offset } = params

            let query = "",
                orderBy = `ORDER BY total_recipes DESC`,
                totalQuery = `SELECT chefs.*, count(recipes) AS total_recipes, (
                    SELECT count(*) FROM chefs
                ) AS total`

            query = `${totalQuery}, chefs.name as chef_name
            FROM chefs
            LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
            GROUP BY chefs.id
            ${orderBy} LIMIT $1 OFFSET $2
            `
            let results = await db.query(query, [limit, offset])

            return results.rows
        } catch (err) {
            console.error(err)
        }
    }
}