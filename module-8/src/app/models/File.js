const fs = require('fs')

const db = require('../../config/db')
const Base = require('./Base')
Base.init({ table: 'files' })

module.exports = {
    ...Base,
    async delete(id) {
        try {
            const result = await db.query(`SELECT * FROM ${this.table} WHERE id = ${id}`)
            const file = result.rows[0]
            
            await db.query(`DELETE FROM ${this.table} WHERE id = $1`, [id])

            return file
        } catch (err) {
            console.error(err)
        }
    }
}