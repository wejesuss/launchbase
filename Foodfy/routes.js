const express = require('express')
const routes = express.Router()
const users = require("./controllers/users")


routes.get("/", users.index)
routes.get("/about", function(req, res) {
    return res.render("users/about")
})
routes.get("/recipes", users.recipes)
routes.get("/recipes/:index", users.recipe)

module.exports = routes