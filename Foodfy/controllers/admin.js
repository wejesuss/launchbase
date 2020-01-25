const fs = require('fs')
const data = require('../data.json')
const { verifyFieldsOfArray } = require('../utils/verifyFields')

exports.index = function (req, res) {
    return res.render("admin/recipes", { recipes: data.recipes });
}

exports.create = function (req, res) {
    return res.render("admin/create");
}

exports.post = function (req, res) {
    const keys = Object.keys(req.body);
    
    for (const key of keys) {
        if (!req.body[key]) {
            if (key != "information") {
                return res.send("Please, fill in all fields!");
            }
        }
    }

    const { 
        image, 
        title,
        author,
        ingredients,
        preparation,
        information
    } = req.body
    
    let id = 0
    const lastId = data.recipes[(data.recipes.length - 1)]

    if (lastId) {
        id = lastId.id + 1
    }

    const emptyIngredient = verifyFieldsOfArray(ingredients);
    const emptyPreparation = verifyFieldsOfArray(preparation);

    if (emptyIngredient || emptyPreparation) {
        return res.send("Please, fill in all fields!");
    }

    data.recipes.push({
        id: id,
        image,
        title,
        author,
        ingredients,
        preparation,
        information
    });

    fs.writeFile("data.json", JSON.stringify(data, null, 2), (err) => {
        if (err) return res.send("Write error!");
        return res.redirect('/admin/recipes');
    });
}

exports.show = function (req, res) {
    const { id } = req.params
    const recipe = data.recipes[id]

    if (!recipe) {
        return res.send("Recipe not found!");
    }

    return res.render("admin/recipe", { recipe });
}

exports.edit = function (req, res) {
    const { id } = req.params
    const recipe = data.recipes[id]

    if (!recipe) {
        return res.send("Recipe not found!");
    }

    return res.render('admin/edit', { recipe });
}

exports.put = function (req, res) {
    const { id, ingredients, preparation } = req.body
    
    const emptyIngredient = verifyFieldsOfArray(ingredients);
    const emptyPreparation = verifyFieldsOfArray(preparation);

    if (emptyIngredient || emptyPreparation) {
        return res.send("Please, fill in all fields!");
    }

    let index = 0
    const recipesFound = data.recipes.find((recipe, indexFound) => {
        if (recipe.id == id) {
            index = indexFound
            return true
        }
    });

    if(!recipesFound) return res.send("Recipe not found!");

    const recipe = {
        ...recipesFound,
        ...req.body,
        id: Number(req.body.id)
    }

    data.recipes[index] = recipe

    fs.writeFile("data.json", JSON.stringify(data, null, 2), (err) => {
        if (err) return res.send("Write error!");
        return res.redirect(`/admin/recipes/${id}`);
    });
}

exports.delete = function (req, res) {
    const { id } = req.body
    
    const recipesFound = data.recipes.find(recipe => recipe.id == id);

    if(!recipesFound) return res.send("Recipe not found!");

    const recipesFiltered = data.recipes.filter(recipe => recipe.id != id)

    data.recipes = recipesFiltered

    fs.writeFile("data.json", JSON.stringify(data, null, 2), (err) => {
        if (err) return res.send("Write error!");
        return res.redirect(`/admin/recipes`);
    });
}