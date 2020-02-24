const express = require('express')
const routes = express.Router()
const Product = require('./app/controllers/product')

routes.get('/', function (req, res) {
    return res.render('layout')
})

routes.get('/products/create', Product.create)
routes.get('/products/:id/edit', Product.edit)

routes.post('/products', Product.post)


// Alias
routes.get('/ads/create', function (req, res) {
    return res.redirect('/products/create')
})

module.exports = routes