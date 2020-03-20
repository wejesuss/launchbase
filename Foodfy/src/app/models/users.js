const db = require('../../config/db')
const fs = require('fs')
const RecipeFiles = require('../models/filesRecipes')

module.exports = {
    all() {
        try {
            return db.query(`SELECT users.*, count(recipes) AS total_recipes
            FROM users
            LEFT JOIN recipes ON (recipes.user_id = users.id)
            GROUP BY users.id
            ORDER BY total_recipes DESC`)
        } catch (err) {
            console.error(err)
        }
    },
    async create(data) {
        try {
            const query = `
            INSERT INTO users (
                name,
                email,
                password,
                is_admin
            ) VALUES ($1, $2, $3, $4)
            RETURNING id`

            const values = [
                data.name,
                data.email,
                data.password,
                data.is_admin
            ]

            let results = await db.query(query, values)
            
            return results.rows[0].id
        } catch (err) {
            console.error(err)
        }
    },
    async find(filters) {
        try {
            let query = `SELECT *
            FROM users`

            Object.keys(filters).map(key => {
                query = `${query} ${key}`
                
                Object.keys(filters[key]).map(filter => {
                    query = `${query} ${filter} = '${filters[key][filter]}' `
                })
            })
            
            let results = await db.query(query)
            
            return results.rows[0]
        } catch (error) {
            console.error(error)
        }
    },
    selectRecipesById(id) {
        try {
            return db.query(`SELECT recipes.*, users.name as user_name
            FROM recipes
            LEFT JOIN users ON (users.id = recipes.user_id)
            WHERE users.id = ${id}
            ORDER BY recipes.created_at DESC`)    
        } catch (err) {
            console.error(err)
        }
    },
    async update(id, fields) {
        try {
            let query = `
            UPDATE users SET
            `

            Object.keys(fields).map((key, index, array) => {
                if(index == (array.length - 1)) {
                    query = `${query}
                        ${key} = '${fields[key]}' 
                    WHERE id = ${id}
                    `
                } else {
                    query = `${query}
                        ${key} = '${fields[key]}', 
                    `
                }
            })

            await db.query(query)
        } catch (err) {
            console.error(err)
        }
    },
    async delete(id) {
        try {
            let results = await db.query(`SELECT recipes.* FROM recipes 
            LEFT JOIN users ON (users.id = recipes.user_id)
            WHERE users.id = ${id}`)
            const recipes = results.rows

            const findFilesPromise = recipes.map(recipe =>  RecipeFiles.find({ where: {recipe_id: recipe.id} }))
            let filesResults = await Promise.all(findFilesPromise)

            await db.query(`DELETE FROM users WHERE id = $1`, [id])

            filesResults.map(results => {
                results.map(async file => {
                    try {
                        await db.query(`DELETE FROM files WHERE id = ${file.id}`)
                        fs.unlinkSync(file.path)    
                    } catch (err) {
                        console.error(err)
                    }
                })
            })

        } catch (error) {
            console.error(error)
        }
    },
    async paginate(params) {
        try {
            const { limit, offset } = params

            let query = "",
                orderBy = `ORDER BY id ASC`,
                totalQuery = `SELECT users.*, (
                    SELECT count(*) FROM users
                ) AS total`

            query = `${totalQuery}
            FROM users
            ${orderBy} LIMIT $1 OFFSET $2
            `
            
            let results = await db.query(query, [limit, offset])
            
            return results.rows
        } catch (err) {
            console.error(err)
        }
    }
}