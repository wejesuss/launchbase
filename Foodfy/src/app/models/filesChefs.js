const db = require('../../config/db')
const fs = require('fs')

module.exports = {
    async create({ filename, path }) {
        try {
            let results = await db.query(
                `INSERT INTO files (
                    name,
                    path
                ) VALUES ($1, $2)
                RETURNING id
            `, [filename, path])
            
            return results.rows[0].id
        } catch (err) {
            console.error(err)
        }
    },
    async find(filters) {
        try {
            let query = `SELECT files.*, chefs.file_id AS file_id
            FROM files
            LEFT JOIN chefs ON (files.id = chefs.file_id)
            `
            
            Object.keys(filters).map(key => {
                query = `${query} ${key}`
                
                Object.keys(filters[key]).map(filter => {
                    query = `${query} chefs.${filter} = '${filters[key][filter]}' `
                })
            })

            query = `${query}
            ORDER BY files.name
            `
            
            let results = await db.query(query)
            
            return results.rows[0]
        } catch (err) {
            console.error(err)
        }
    },
    findRecipesFiles(recipe_id) {
        try {
            return db.query(`SELECT file_id AS id, recipe_id, files.name, files.path
            FROM recipe_files
            LEFT JOIN files ON (files.id = recipe_files.file_id)
            WHERE recipe_files.recipe_id = ${recipe_id}
            ORDER BY files.name`)
        } catch (err) {
            console.error(err)
        }
    },
    async delete(chef_id, id) {
        try {
            await db.query(`UPDATE chefs SET file_id = NULL WHERE id = ${chef_id}`)

            let result = await db.query(`SELECT * FROM files WHERE id = ${id}`)
            const file = result.rows[0]

            if (file) fs.unlinkSync(file.path)

            return db.query(`DELETE FROM files WHERE id = $1`, [id])
        } catch (err) {
            console.error(err)
        }
    }
}