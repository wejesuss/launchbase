const { formatPrice } = require('../../lib/utils')
const Product = require('../models/Product')
const File = require('../models/File')
const Category = require('../models/Category')

module.exports = {
    async index(req, res) {
        try {
            let results,
                params = {}

            const { filter, category }= req.query

            if(!filter) return res.redirect("/")

            params.filter = filter

            if(category) {
                params.category = category
            }

            async function getImage(productId) {
                let image = await File.find(productId)
                const files = image.rows.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
    
                return files[0]
            }

            results = await Product.search(params)
            const producstPromisse = results.rows.map(async product => {
                product.image = await getImage(product.id)
                product.previous_price = formatPrice(product.previous_price).replace("R$", "R$ ")
                product.price = formatPrice(product.price).replace("R$", "R$ ")
                return product
            })

            const products = await Promise.all(producstPromisse)

            const search = {
                term: req.query.filter,
                total: products.length
            }

            const categories = products.map(product => ({
                id: product.category_id,
                name: product.category_name
            })).reduce((categoriesFiltered, category) => {
                const found = categoriesFiltered.some(cat => cat.id == category.id)

                if(!found)
                    categoriesFiltered.push(category)
                
                return categoriesFiltered
            }, [])


            return res.render('search/index', { products, search, categories })
               
        } catch (error) {
            console.error(error)
        }
    }
}