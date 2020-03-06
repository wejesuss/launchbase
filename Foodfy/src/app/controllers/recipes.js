const Recipes = require('../models/recipes')
const RecipeFiles = require('../models/filesRecipes')
const { verifyFieldsOfArray } = require('../../utils/utils')

exports.index = function(req, res) {
    let { page, limit } = req.query
    page = page || 1
    limit = limit || 4
    
    let offset = limit * (page - 1)
    const params = {
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

            return res.render("admin/recipes/index", { recipes, pagination })
        }
    }

    Recipes.paginate(params)
}

exports.create = async function(req, res) {
    const results = await Recipes.recipeSelectOptions()
    const options = results.rows

    if(!options) return res.send("Chefs not found! You can not create a recipe!")

    return res.render('admin/recipes/create', {chefs: options})
}

exports.post = async function(req, res) {
    const keys = Object.keys(req.body);
    
    for (const key of keys) {
        if (!req.body[key]) {
            if (key != "information") {
                return res.send("Please, fill in all fields!");
            }
        }
    }

    if(req.files.length == 0) return res.send("Please send at least one image!")

    const filesPromise = req.files.map(file => RecipeFiles.create({...file}))
    let filesIds = await Promise.all(filesPromise)
    
    filesIds = filesIds.map(file => (file.rows[0].id)).sort()

    let results = await Recipes.create(req.body)
    const recipeId = results.rows[0].id

    const recipeFilesPromise = filesIds.map(id => RecipeFiles.createRecipeFiles(recipeId, id))
    await Promise.all(recipeFilesPromise)

    return res.redirect(`/admin/recipes/${recipeId}`)
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
        async callback(recipe) {
            if (!recipe) {
                return res.send("Recipe not found!");
            }

            let results = await Recipes.recipeSelectOptions()
            const options = results.rows

            return res.render('admin/recipes/edit', { recipe, chefs: options });
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