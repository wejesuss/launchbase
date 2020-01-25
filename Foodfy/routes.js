const express = require('express')
const routes = express.Router()
const users = require("./controllers/users")
const admin = require("./controllers/admin")

// users
routes.get("/", users.index)
routes.get("/about", function(req, res) {
    return res.render("users/about")
})
routes.get("/recipes", users.recipes)
routes.get("/recipes/:index", users.recipe)

// admin
routes.get("/admin/recipes", admin.index)
routes.get('/admin/recipes/create', admin.create)
routes.get("/admin/recipes/:id", admin.show)
routes.get('/admin/recipes/:id/edit', admin.edit)

routes.post('/admin/recipes', admin.post)
routes.put('/admin/recipes', admin.put)
routes.delete('/admin/recipes', admin.delete)

module.exports = routes