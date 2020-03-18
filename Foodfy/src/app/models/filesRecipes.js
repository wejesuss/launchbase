const db = require('../../config/db')
const fs = require('fs')

module.exports = {
    create({ filename, path }) {
        try {
            return db.query(
                `INSERT INTO files (
                    name,
                    path
                ) VALUES ($1, $2)
                RETURNING id
            `, [filename, path])

        } catch (err) {
            console.error(err)
        }
    },
    createRecipeFiles(recipe_id, file_id) {
        try {
            return db.query(`
                INSERT INTO recipe_files (
                    recipe_id,
                    file_id
                ) VALUES ($1, $2)
                RETURNING id
            `, [recipe_id, file_id])
        } catch (err) {
            console.error(err)
        }
    },
    async find(filters) {
        try {
            let query = `SELECT file_id AS id, recipe_id, files.name, files.path
            FROM recipe_files
            LEFT JOIN files ON (files.id = recipe_files.file_id)`

            Object.keys(filters).map(key => {
                query = `${query} ${key}`
                
                Object.keys(filters[key]).map(filter => {
                    query = `${query} recipe_files.${filter} = '${filters[key][filter]}' `
                })
            })
            query = `${query}
            ORDER BY files.name
            `

            let results = await db.query(query)
            
            return results.rows
        } catch (err) {
            console.error(err)
        }
    },
    async delete(file_id) {
        try {
            await db.query(`DELETE FROM recipe_files WHERE file_id = ${file_id}`)

            let result = await db.query(`SELECT * FROM files WHERE id = ${file_id}`)
            const file = result.rows[0]

            if (file) fs.unlinkSync(file.path)

            return db.query(`DELETE FROM files WHERE id = $1`, [file_id])
        } catch (err) {
            console.error(err)
        }
    }
}