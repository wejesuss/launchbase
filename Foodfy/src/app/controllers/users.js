const Recipes = require('../models/recipes')

exports.index = function(req, res) {
    const home = {
        title:"As melhores receitas",
        presentation:"Aprenda a construir os melhores pratos com receitas criadas por profissionais do mundo inteiro.",
        chef_url:'/images/layouts/assets/chef.png'        
    }

    const params = {
        limit : 6,
        callback(recipes) {
            return res.render("users/home", {home, recipes})
        }
    }

    Recipes.findByLimit(params)
}

exports.list = function(req, res) {
    const { filter } = req.query

    const params = {
        filter,
        callback(recipes) {
            return res.render("users/recipes", {recipes, filter})
        }
    }

    Recipes.paginate(params)
}

exports.show = function(req, res) {
    const {index: id} = req.params
    const params = {
        id,
        callback(recipe) {
            if(!recipe) {
                return res.send("Recipe not found!")
            }

            return res.render("users/recipe", {recipe})
        }
    }

    Recipes.find(params)
}