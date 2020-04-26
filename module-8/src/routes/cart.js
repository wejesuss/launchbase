const express = require('express')
const routes = express.Router()

const CartController = require('../app/controllers/CartController')

routes.get('/', CartController.index)
    .post('/:productId/add-one', CartController.addOne)
    .post('/:productId/remove-one', CartController.removeOne)
    .post('/:productId/delete', CartController.delete)
    .post('/delete-all', CartController.deleteAll)

module.exports = routes