const express = require('express')
const routes = express.Router()

const OrderController = require('../app/controllers/OrderController')
const { registeredUsersOnly } = require('../app/middlewares/session')

routes.get('/', registeredUsersOnly, OrderController.index)
    .post('/', registeredUsersOnly, OrderController.post)
    .get('/sales', registeredUsersOnly, OrderController.sales)
    .get('/:id', registeredUsersOnly, OrderController.show)
    .post('/:id/:action', registeredUsersOnly, OrderController.update)

module.exports = routes