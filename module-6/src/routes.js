const express = require('express')
const routes = express.Router()
const Product = require('./app/controllers/product')
const Home = require('./app/controllers/home')
const Search = require('./app/controllers/search')
const multer = require('./app/middlewares/multer')

// Home
routes.get('/', Home.index)

// Search
routes.get('/products/search', Search.index)

// Products
routes.get('/products/create', Product.create)
routes.get('/products/:id', Product.show)
routes.get('/products/:id/edit', Product.edit)

routes.post('/products', multer.array('photos', 6), Product.post)
routes.put('/products', multer.array('photos', 6), Product.put)
routes.delete('/products', Product.delete)

// Alias
routes.get('/ads/create', function (req, res) {
    return res.redirect('/products/create')
})

module.exports = routes