const connection = require('./database')

const Base = require('./Base')
Base.init({ table: "chefs" })

module.exports = {
    ...Base,
    async find(id) {
        try {
            const results = await connection(`${this.table}`).select([`${this.table}.*`])
                .leftJoin('recipes', 'chefs.id', '=', 'recipes.chef_id').count('recipes as total_recipes')
                .where('chefs.id', id).groupBy('chefs.id')
            return results[0]
        } catch (error) {
            console.error(error)
        }
    },
    async paginate(params) {
        try {
            let { limit, offset } = params
            if(limit < 0 ||offset < 0) {
                limit *= -1
                offset *= -1
            }

            const { count: total } = await connection(`${this.table}`).count().first()
            const results = await connection(`${this.table}`)
                .select([`${this.table}.*`])
                .leftJoin('recipes', 'chefs.id', '=', 'recipes.chef_id').count('recipes as total_recipes')
                .groupBy('chefs.id')
                .limit(limit).offset(offset).orderBy('total_recipes', 'desc')

            results.map(result => result.total = total)
         
            return results
        } catch (error) {
            console.error(error)
        }
    },
    async selectRecipesById(id) {
        try {
            const results = await connection('recipes')
                .select(['recipes.*', 'chefs.name as chef_name'])
                .leftJoin('chefs', 'chefs.id', '=', 'recipes.chef_id')
                .where('chefs.id', id)
                .orderBy('recipes.created_at', 'desc')
            
            return results
        } catch (err) {
            console.error(err)
        }
    },
}