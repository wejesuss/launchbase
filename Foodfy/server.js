const express = require('express')
const nunjucks = require('nunjucks')
const recipes = require("./data")

const server = express()

server.use(express.static('public'))

server.set("view engine", "njk")

nunjucks.configure("views", {
    express: server,
    noCache: true,
    autoescape: false
})

server.get("/", function(req, res) {
    const home = {
        title:"As melhores receitas",
        presentation:"Aprenda a construir os melhores pratos com receitas criadas por profissionais do mundo inteiro.",
        chef_url:'/images/layouts/assets/chef.png'        
    }

    const recipesFiltered = []
    for (let i = 0; i < 6; i++) {
        const obj = recipes[i]
        obj.id = i
        recipesFiltered.push(obj)
    }

    return res.render("home", {home, recipes : recipesFiltered})
})

server.get("/about", function(req, res) {
    return res.render("about")
})

server.get("/recipes", function(req, res) {
    const recipesAddedId = []
    
    for (let i=0; i < recipes.length; i++) {
        const obj = recipes[i]
        obj.id = i
        recipesAddedId.push(obj)
    }

    return res.render("recipes", {recipes : recipesAddedId})
})

server.get("/recipes/:index", function(req, res) {
    const {index: recipeIndex} = req.params
    const recipe = recipes[recipeIndex]
    
    if(!recipe) {
        return res.send("Recipe not found!")
    }

   return res.render("recipe", {recipe})
})


server.listen(5000, function() {

})