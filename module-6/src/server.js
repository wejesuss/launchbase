const express = require('express')
const methodOverride = require('method-override')
const nunjucks = require('nunjucks')
const routes = require("./routes")

const server = express()

server.use(express.urlencoded({ extended:true }))
server.use(express.static('public'))
server.use(methodOverride('_method'))
server.use(routes)

server.set("view engine", "njk")

nunjucks.configure("src/app/views", {
    express: server,
    noCache: true,
    autoescape: false
})


server.listen(5000, function () {

})