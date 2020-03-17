const express = require('express')
const routes = express.Router()
const guest = require("../app/controllers/guest")

routes.get('/', guest.index)
routes.get('/about', function(req, res) {
    return res.render("guest/about")
})
routes.get('/recipes', guest.list)
routes.get('/recipes/:id', guest.show)

routes.get('/chefs', guest.listChefs)

module.exports = routes