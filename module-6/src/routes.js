const express = require('express')
const routes = express.Router()
const Product = require('./app/controllers/product')
const multer = require('./app/middlewares/multer')

routes.get('/', function (req, res) {
    return res.render('layout')
})

routes.get('/products/create', Product.create)
routes.get('/products/:id/edit', Product.edit)
// routes.get('/products/:id', Product.show)

routes.post('/products', multer.array('photos', 6), Product.post)
routes.put('/products', multer.array('photos', 6), Product.put)
routes.delete('/products', Product.delete)


// Alias
routes.get('/ads/create', function (req, res) {
    return res.redirect('/products/create')
})

module.exports = routes