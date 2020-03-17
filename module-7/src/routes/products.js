const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const Product = require('../app/controllers/ProductController')
const Search = require('../app/controllers/SearchController')

const { registeredUsersOnly } = require('../app/middlewares/session')

routes.get('/search', Search.index)

routes.get('/create', registeredUsersOnly, Product.create)
routes.get('/:id', Product.show)
routes.get('/:id/edit', registeredUsersOnly, Product.edit)

routes.post('/', registeredUsersOnly, multer.array('photos', 6), Product.post)
routes.put('/', registeredUsersOnly, multer.array('photos', 6), Product.put)
routes.delete('/', registeredUsersOnly, Product.delete)

module.exports = routes