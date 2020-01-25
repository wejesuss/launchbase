const data = require('../data.json')

exports.index = function(req, res) {
    const home = {
        title:"As melhores receitas",
        presentation:"Aprenda a construir os melhores pratos com receitas criadas por profissionais do mundo inteiro.",
        chef_url:'/images/layouts/assets/chef.png'        
    }

    const recipesFiltered = data.recipes.filter((recipe, index) => {
        if (index < 6) return recipe
    })

    return res.render("users/home", {home, recipes : recipesFiltered})
}

exports.recipes = function(req, res) {
    return res.render("users/recipes", {recipes : data.recipes})
}

exports.recipe = function(req, res) {
    const {index: recipeIndex} = req.params
    const recipe = data.recipes[recipeIndex]
    
    if(!recipe) {
        return res.send("Recipe not found!")
    }

    return res.render("users/recipe", {recipe})
}