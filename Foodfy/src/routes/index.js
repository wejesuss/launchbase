const express = require('express')
const routes = express.Router()
const admin = require('./admin')
const home = require('./home')

// home
routes.use("/", home)

// admin
routes.use("/admin", admin)


// Alias
routes.get('/admin', function (req, res) {
    return res.redirect('/admin/recipes')
})


module.exports = routes