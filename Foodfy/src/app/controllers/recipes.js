const Recipes = require('../models/recipes')
const { verifyFieldsOfArray } = require('../../utils/utils')

exports.index = function(req, res) {
    Recipes.all(function(recipes) {
        return res.render("admin/recipes/index", {recipes});
    })
}

exports.create = function(req, res) {
    Recipes.recipeSelectOptions(function(options) {
        if(!options) return res.send("Chefs not found!")

        return res.render('admin/recipes/create', {chefs: options})
    })
}

exports.post = function(req, res) {
    const keys = Object.keys(req.body);
    
    for (const key of keys) {
        if (!req.body[key]) {
            if (key != "information") {
                return res.send("Please, fill in all fields!");
            }
        }
    }

    const emptyIngredient = verifyFieldsOfArray(req.body.ingredients);
    const emptyPreparation = verifyFieldsOfArray(req.body.preparation);

    if (emptyIngredient || emptyPreparation) {
        return res.send("Please, fill in all fields!");
    }

    Recipes.create(req.body, function(recipe) {
        return res.redirect(`/admin/recipes/${recipe.id}`)
    })
}

exports.show = function(req, res) {
    const { id } = req.params

    const params = {
        id,
        callback(recipe) {
            if (!recipe) {
                return res.send("Recipe not found!");
            }

            return res.render("admin/recipes/recipe", {recipe});
        }
    }

    Recipes.find(params)
}

exports.edit = function(req, res) {
    const { id } = req.params
    const params = {
        id,
        callback(recipe) {
            if (!recipe) {
                return res.send("Recipe not found!");
            }

            Recipes.recipeSelectOptions(function(options) {
                return res.render('admin/recipes/edit', { recipe, chefs: options });
            })
        }
    }

    Recipes.find(params)

}

exports.put = function(req, res) {
    const { id, ingredients, preparation } = req.body
    
    const keys = Object.keys(req.body);
    
    for (const key of keys) {
        if (!req.body[key]) {
            if (key != "information") {
                return res.send("Please, fill in all fields!");
            }
        }
    }
    
    const emptyIngredient = verifyFieldsOfArray(ingredients);
    const emptyPreparation = verifyFieldsOfArray(preparation);

    if (emptyIngredient || emptyPreparation) {
        return res.send("Please, fill in all fields!");
    }

    Recipes.update(req.body, function() {
        return res.redirect(`/admin/recipes/${id}`)
    })
}

exports.delete = function(req, res) {
    const { id } = req.body
    
    Recipes.delete(id, function() {
        return res.redirect('/admin/recipes')        
    })
}