const { formatPrice } = require('../../lib/utils')
const Product = require('../models/Product')
const File = require('../models/File')

module.exports = {
    async index(req, res) {
        try {
            let results = await Product.all()
            const products = results.rows
    
            if(!products) return res.send("Products not found!")
    
            async function getImage(productId) {
                let results = await File.find(productId)
                const files = results.rows.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)
    
                return files[0]
            }
    
            const productsPromise = products.map(async product => {
                product.image = await getImage(product.id)
                product.previous_price = formatPrice(product.previous_price).replace("R$", "R$ ")
                product.price = formatPrice(product.price).replace("R$", "R$ ")
                return product
            }).filter((product, index) => index > 2 ? false : true)
    
            const lastedAdded = await Promise.all(productsPromise)
    
            return res.render('home/index', { products: lastedAdded })
               
        } catch (error) {
            console.error(error)
        }
    }
}