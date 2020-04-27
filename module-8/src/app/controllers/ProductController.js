const { unlinkSync } = require('fs')

const Category = require('../models/Category')
const Product = require('../models/Product')
const File = require('../models/File')

const LoadProductService = require('../services/loadProductService')

module.exports = {
    async create(req, res) {
        try {
            const categories = await Category.findAll()
            
            return res.render('products/create', {categories})
        } catch (err) {
            console.error(err)
        }
    },
    async post(req, res) {
        try {
            let { category_id, name, description, previous_price, price, quantity, status } = req.body
            price = price.replace(/\D/g,"")
    
            const product_id = await Product.create({ 
                category_id, 
                user_id: req.session.userId, 
                name,
                description, 
                previous_price: previous_price || price, 
                price, 
                quantity, 
                status: status || 1
            })
            
            const filesPromise = req.files.map(file => File.create({name: file.filename, path: file.path.replace(/\\/g, "/" ), product_id}))
            await Promise.all(filesPromise)
    
            return res.redirect(`/products/${product_id}/edit`)   
        } catch (err) {
            console.error(err)
        }
    },
    async show(req, res) {
       try {
            const product = await LoadProductService.load('product', { where: {id: req.params.id} })

            if (!product) return res.send("Product not found!")

            return res.render("products/show", { product })
       } catch (err) {
           console.error(err)
       }
    },
    async edit(req, res) {
        try {
            const { product } = req
            if (!product) return res.send("Product not found!")
    
            const categories = await Category.findAll()
    
            return res.render(`products/edit`, { product, categories })
        } catch (err) {
            console.error(err)
        }
    },
    async put(req, res) {
        try {
            if (req.body.removed_files) {
                const removed_files = req.body.removed_files.split(',')
                const lastIndex = removed_files.length - 1
                removed_files.splice(lastIndex, 1)
    
                const removedFilesPromise = removed_files.map(id => File.delete(id))
                const files = await Promise.all(removedFilesPromise)
                
                if(files) {
                    files.map(file => {
                        try {
                            unlinkSync(file.path)
                        } catch (err) {
                            console.error(err)
                        }
                    })
                }
            }
    
            if(req.files && req.files.length != 0) {
                let oldFiles = await Product.files(req.body.id)[0]
                oldFiles = (oldFiles) ? Number(oldFiles.total) : 0
                const totalFiles = oldFiles + req.files.length

                if(totalFiles <= 6 ) {
                    const newFilesPromise = req.files.map(file => 
                        File.create({name: file.filename, path: file.path.replace(/\\/g, "/" ), product_id: req.body.id}))
                
                    await Promise.all(newFilesPromise)
                }
                
            }
    
            req.body.price = req.body.price.replace(/\D/g,"")
            
            if (req.body.price != req.body.previous_price) {
                const previousProduct = await Product.find(req.body.id)
                req.body.previous_price = previousProduct.price
            }
    
            await Product.update(req.body.id, {
                category_id: req.body.category_id,
                name: req.body.name,
                description: req.body.description,
                previous_price: req.body.previous_price,
                price: req.body.price,
                quantity: req.body.quantity,
                status: req.body.status,
            })
    
            return res.redirect(`/products/${req.body.id}`)
        } catch (err) {
            console.error(err)
        }
    },
    async delete(req, res) {
        try {
            let files = await Product.files(req.body.id)
            
            await Product.delete(req.body.id)
    
            if(files && (files[0].total > 1)) {
                files.shift()
                
                files.map(file => {
                    try {
                        !file.path.includes('placeholder.png') ? unlinkSync(file.path) : null
                    } catch (err) {
                        console.error(err)
                    }
                })
            }
            
            return res.redirect('/products/create')
        } catch (err) {
            console.error(err)
        }
    }
}