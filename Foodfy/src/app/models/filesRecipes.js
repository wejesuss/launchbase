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
    find(file_id) {
        try {
            return db.query(`SELECT files.*, recipes.file_id AS file_id
            FROM files
            LEFT JOIN recipes ON (files.id = recipes.file_id)
            WHERE file_id = ${file_id}`)
        } catch (err) {
            console.error(err)
        }
    },
    async delete(recipe_id, id) {
        try {
            await db.query(`UPDATE recipes SET file_id = NULL WHERE id = ${recipe_id}`)

            let result = await db.query(`SELECT * FROM files WHERE id = ${id}`)
            const file = result.rows[0]

            if (file) fs.unlinkSync(file.path)

            return db.query(`DELETE FROM files WHERE id = $1`, [id])
        } catch (err) {
            console.error(err)
        }
    }
}