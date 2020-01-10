const recipes = require('../data.json').recipes

exports.index = function(req, res) {
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

    return res.render("users/home", {home, recipes : recipesFiltered})
}

exports.recipes = function(req, res) {
    const recipesAddedId = []
    
    for (let i=0; i < recipes.length; i++) {
        const obj = recipes[i]
        obj.id = i
        recipesAddedId.push(obj)
    }
    
    return res.render("users/recipes", {recipes : recipesAddedId})
}

exports.recipe = function(req, res) {
    const {index: recipeIndex} = req.params
    const recipe = recipes[recipeIndex]
    
    if(!recipe) {
        return res.send("Recipe not found!")
    }

    return res.render("users/recipe", {recipe})
}