const express = require('express')
const routes = express.Router()
const recipes = require("./app/controllers/recipes")
const admin = require("./app/controllers/admin")
const chefs = require("./app/controllers/chefs")

// recipes
routes.get('/', recipes.index)
routes.get('/about', function(req, res) {
    return res.render('users/about')
})
routes.get('/recipes', recipes.list)
routes.get('/recipes/:index', recipes.show)

routes.get('/chefs', chefs.index)

// admin
routes.get('/admin', (req, res) => res.redirect('/admin/recipes'))
routes.get('/admin/recipes', admin.index)
routes.get('/admin/recipes/create', admin.create)
routes.get('/admin/recipes/:id', admin.show)
routes.get('/admin/recipes/:id/edit', admin.edit)

routes.post('/admin/recipes', admin.post)
routes.put('/admin/recipes', admin.put)
routes.delete('/admin/recipes', admin.delete)

routes.get('/admin/chefs', chefs.index)
routes.get('/admin/chefs/create', chefs.create)
routes.get('/admin/chefs/:id', chefs.show)
routes.get('/admin/chefs/:id/edit', chefs.edit)

routes.post('/admin/chefs', chefs.post)
routes.put('/admin/chefs', chefs.put)
routes.delete('/admin/chefs', chefs.delete)

module.exports = routes