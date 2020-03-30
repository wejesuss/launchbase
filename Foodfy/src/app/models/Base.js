const db = require('../../config/db')
const connection = require('./database')

async function find(filters, table, join) {
    try {
        let query = `SELECT * FROM ${table}`

        if(join) {
            const { tableB, rule, aliases } = join

            if(aliases) {
                query = `SELECT ${table}.*, ${aliases}
                FROM ${table}
                LEFT JOIN ${tableB} ON (${rule})
                `
            } else {
                query = `SELECT ${table}.*
                FROM ${table}
                LEFT JOIN ${tableB} ON (${rule})
                `
            }
        }

        if(filters) {
            Object.keys(filters).map(key => {
            query += ` ${key}
            `
                Object.keys(filters[key]).map(field => {
                    query += ` ${field} = '${filters[key][field]}'
                    `
                })
            })
        }

        if(join && join.orderBy)
            query += ` ORDER BY ${join.orderBy}`

        return db.query(query)
    } catch (err) {
        console.error(err)
    }
}

const Base = {
    init({ table }) {
        if(!table) throw new Error("Invalid table name!")

        this.table = table
        return this
    },
    async findAll(filters, join) {
        try {
            const results = await find(filters, this.table, join)
            return results.rows
        } catch (err) {
            console.error(err)
        }
    },
    async find(id, join) {
        try {
            const results = await find({ where: {id} }, this.table, join)
            return results.rows[0]
        } catch (err) {
            console.error(err)
        }
    },
    async findOne(filters, join) {
        try {
            const results = await find(filters, this.table, join)
            return results.rows[0]
        } catch (err) {
            console.error(err)
        }
    },
    async create(fields) {
        try {
            const results = await connection(`${this.table}`).insert({
               ...fields
            }).returning('id')

            return results[0]
        } catch (err) {
            console.error(err)
        }
    },
    update(id, fields) {
        try {
            return connection(`${this.table}`).update({
                ...fields
            }).where('id', id)
        } catch (err) {
            console.error(err)
        }
    },
    delete(id) {
        try {
            return connection(`${this.table}`).where('id', id).delete()
        } catch (err) {
            console.error(err)
        }
    },
    async paginate(params) {
        try {
            const { limit, offset } = params

            const { count: total } = await connection(`${this.table}`).count().first()
            const results = await connection(`${this.table}`)
                .select([`${this.table}.*`])
                .limit(limit).offset(offset).orderBy('id', 'asc')

            results.map(result => result.total = total)
         
            return results
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = Base