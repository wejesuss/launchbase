const { formatPrice, date } = require('../../lib/utils')
const Category = require('../models/Category')
const Product = require('../models/Product')
const File = require('../models/File')

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
                return res.send("Please, fill in all fields")
            }
        }

        if (req.files.length == 0) 
            return res.send("Please, send at least one image!")

        let results = await Product.create(req.body)
        const productId = results.rows[0].id

        const filesPromise = req.files.map(file => File.create({...file, product_id: productId}))
        await Promise.all(filesPromise)

        return res.redirect(`/products/${productId}/edit`)
    },
    async show(req, res) {
        let results = await Product.find(req.params.id)
        const product = results.rows[0]

        if (!product) return res.send("Product not found!")

        const { day, minutes,  hour, month } = date(product.updated_at)

        product.published = {
            day: `${day}/${month}`,
            hour: `${hour}h${minutes}`,
        }

        product.previous_price = formatPrice(product.previous_price).replace("R$", "R$ ")
        product.price = formatPrice(product.price).replace("R$", "R$ ")

        // get images
        results = await File.find(product.id)
        let files = results.rows
        files = files.map(file => ({ 
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }))

        return res.render(`products/show`, { product, files })
    },
    async edit(req, res) {
        let results = await Product.find(req.params.id)
        const product = results.rows[0]

        if (!product) return res.send("Product not found!")

        product.previous_price = formatPrice(product.previous_price).replace("R$", "R$ ")
        product.price = formatPrice(product.price).replace("R$", "R$ ")
        
        // get Category
        results = await Category.all()
        const categories = results.rows
        
        // get images
        results = await File.find(product.id)
        let files = results.rows
        files = files.map(file => ({ 
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }))

        return res.render(`products/edit`, { product, categories, files })
    },
    async put(req, res) {
        const keys = Object.keys(req.body)

        for (const key of keys) {
            if (req.body[key] == "" && key != "removed_files") {
                res.send("Please, fill in all fields")
            }
        }

        if (req.body.removed_files) {
            const removed_files = req.body.removed_files.split(',')
            const lastIndex = removed_files.length - 1
            removed_files.splice(lastIndex, 1)

            const removedFilesPromise = removed_files.map(id => File.delete(id))
            
            await Promise.all(removedFilesPromise)
        }

        if(req.files.length != 0) {
            const oldFiles = await File.find(req.body.id)
            const totalFiles = oldFiles.rows.length + req.files.length

            if(totalFiles <= 6 ) {
                const newFilesPromise = req.files.map(file => 
                    File.create({...file, product_id: req.body.id}))
            
                await Promise.all(newFilesPromise)
            }
            
        }

        req.body.price = req.body.price.replace(/\D/g,"")
        
        if (req.body.price != req.body.previous_price) {
            const previousProduct = (await Product.find(req.body.id)).rows[0]
            req.body.previous_price = previousProduct.price
        }

        await Product.update(req.body)

        return res.redirect(`/products/${req.body.id}`)
    },
    async delete(req, res) {
        let results = await File.find(req.body.id)
        const files = results.rows

        if(files) {
            const removeFilesPromise = files.map(file => File.delete(file.id))
            
            await Promise.all(removeFilesPromise)
        }
        
        await Product.delete(req.body.id)

        return res.redirect('/')
    }
}