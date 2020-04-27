const db = require('../../config/db')

const Base = require('./Base')
Base.init({ table: 'products' })

module.exports = {
    ...Base,
    async search({ filter, category }) {
        try {
            let query = `
            SELECT products.*,
                categories.name AS category_name
            FROM products
            LEFT JOIN categories ON (categories.id = products.category_id)
            WHERE 1 = 1`
            
            if (category) {
                query += ` AND products.category_id = ${category}`
            }
            
            if(filter) {
                query += ` AND (products.name ILIKE '%${filter}%'
                OR products.description ILIKE '%${filter}%')
                `
            }

            query += ` AND products.status != 0
                ORDER BY products.id
            `
    
            const results = await db.query(query)
            return results.rows   
        } catch (err) {
            console.error(err)
        }
    },
    async files(product_id) {
        const results = await db.query(`SELECT *, (SELECT count(*) FROM files WHERE product_id = $1) AS total
        FROM files WHERE product_id = $1`, [product_id])

        return results.rows
    },
}