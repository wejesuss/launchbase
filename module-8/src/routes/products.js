const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const Product = require('../app/controllers/ProductController')
const Search = require('../app/controllers/SearchController')

const { registeredUsersOnly, ownersOnly } = require('../app/middlewares/session')

const ProductValidator = require('../app/validators/products')

routes.get('/search', Search.index)

routes.get('/create', registeredUsersOnly, Product.create)
routes.get('/:id', Product.show)
routes.get('/:id/edit', registeredUsersOnly, ownersOnly, Product.edit)

routes.post('/', registeredUsersOnly, multer.array('photos', 6), ProductValidator.post, Product.post)
routes.put('/', registeredUsersOnly, multer.array('photos', 6), ProductValidator.put, Product.put)
routes.delete('/', registeredUsersOnly, Product.delete)

module.exports = routes