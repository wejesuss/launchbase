const express = require('express')
const routes = express.Router()

const Home = require('../app/controllers/HomeController')

const products = require('./products')
const users = require('./users')
const cart = require('./cart')
const orders = require('./orders')

routes.get('/', Home.index)

routes.use("/products", products)
routes.use("/users", users)
routes.use("/orders", orders)
routes.use("/cart", cart)

// Alias
routes.get('/ads/create', function (req, res) {
    return res.redirect('/products/create')
})

routes.get('/accounts', function (req, res) {
    return res.redirect('/users/login')
})

routes.get('/sales', function (req, res) {
    return res.redirect('/orders/sales')
})

routes.get('/order', function (req, res) {
    return res.redirect('/orders')
})

module.exports = routes