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
    find(recipe_id) {
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