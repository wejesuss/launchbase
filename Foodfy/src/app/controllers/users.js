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
    let { filter, page, limit } = req.query
    page = page || 1
    limit = limit || 2
    
    let offset = limit * (page - 1)

    const params = {
        filter,
        limit,
        offset,
        callback(recipes) {
            let pagination
            if(recipes[0]) {
                pagination = {
                    total: Math.ceil(recipes[0].total / limit),
                    page
                }
            }

            return res.render("users/recipes", { recipes, filter, pagination })
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