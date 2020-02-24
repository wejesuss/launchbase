const { formatPrice } = require('../../lib/utils')
const Category = require('../models/Category')
const Product = require('../models/Product')

module.exports = {
    create(req, res) {
        Category.all().then(function(results) {
            const categories = results.rows
            
            return res.render('products/create', {categories})
        }).catch(function(err) {
            throw new Error(err)
        })
        
    },
    async post(req, res) {
        const keys = Object.keys(req.body)

        for (const key of keys) {
            if (req.body[key] == "") {
                res.send("Please, fill in all fields")
            }
        }

        let results = await Product.create(req.body)
        const productId = results.rows[0].id

        return res.redirect(`/products/${productId}`)
    },
    async edit(req, res) {
        let results = await Product.find(req.params.id)
        const product = results.rows[0]

        if (!product) return res.send("Product not found!")

        product.previous_price = formatPrice(product.previous_price)
        product.price = formatPrice(product.price)
        
        results = await Category.all()
        const categories = results.rows

        return res.render(`products/edit`, { product, categories })
    }
}