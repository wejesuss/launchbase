const Recipes = require('../models/recipes')
const RecipeFiles = require('../models/filesRecipes')
const { addSrcToFilesArray } = require('../../utils/utils')

exports.index = async function(req, res) {
    let { page, limit } = req.query
    page = page || 1
    limit = limit || 4
    
    let offset = limit * (page - 1)
    const params = {limit, offset}

    let results = await Recipes.paginate(params)
    const recipes = results.rows
    
    let pagination
    if(recipes[0]) {
        pagination = {
            total: Math.ceil(recipes[0].total / limit),
            page,
            limit
        }
    }

    const searchFilesPromise = recipes.map(recipe => RecipeFiles.find(recipe.id))
    let files = await Promise.all(searchFilesPromise)
    files = files.reduce((imagesArray, currentImage) => {
        if(currentImage.rows[0]) imagesArray.push(currentImage.rows[0])

        return imagesArray
    }, [])

    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)

    return res.render("admin/recipes/index", { recipes, pagination, files })
}

exports.create = async function(req, res) {
    const results = await Recipes.recipeSelectOptions()
    const options = results.rows

    if(!options) return res.send("Chefs not found! You can not create a recipe!")

    return res.render('admin/recipes/create', {chefs: options})
}

exports.post = async function(req, res) {
    const keys = Object.keys(req.body)
    
    for (const key of keys) {
        if (!req.body[key]) {
            if (key != "information") {
                return res.send("Please, fill in all fields!")
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

exports.show = async function(req, res) {
    const { id } = req.params

    let results = await Recipes.find(id)
    const recipe = results.rows[0]

    if (!recipe) return res.send("Recipe not found!")

    results = await RecipeFiles.find(recipe.id)
    let files = results.rows
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)

    return res.render("admin/recipes/recipe", {recipe, files})
}

exports.edit = async function(req, res) {
    const { id } = req.params
    
    let results = await Recipes.find(id)
    const recipe = results.rows[0]

    if (!recipe) {
        return res.send("Recipe not found!")
    }

    results = await RecipeFiles.find(recipe.id)
    let files = results.rows
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
    
    results = await Recipes.recipeSelectOptions()
    const options = results.rows

    return res.render('admin/recipes/edit', { recipe, chefs: options, files })
}

exports.put = async function(req, res) {
    const { removed_files } = req.body
    
    const keys = Object.keys(req.body)
    
    for (const key of keys) {
        if (!req.body[key] && key != "information" && key != "removed_files") {
            return res.send("Please, fill in all fields!")
        }
    }
    
    if(removed_files) {
        const oldFiles = await RecipeFiles.find(req.body.id)

        const removedFiles = removed_files.split(',')
        const lastIndex = removedFiles.length - 1
        removedFiles.splice(lastIndex, 1)

        if (req.files.length == 0 && removedFiles.length == oldFiles.rows.length) {
            return res.send("Please send at least one image!")
        }

        const removedFilesPromise = removedFiles.map(id => RecipeFiles.delete(id))
            
        await Promise.all(removedFilesPromise)
    }

    let filesIds
    if(req.files.length != 0) {
        const oldFiles = await RecipeFiles.find(req.body.id)
        const totalFiles = oldFiles.rows.length + req.files.length

        if(totalFiles <= 5) {
            const filesPromise = req.files.map(file => RecipeFiles.create({...file}))
            filesIds = await Promise.all(filesPromise)
            filesIds = filesIds.map(file => (file.rows[0].id)).sort()
        }
    }

    if(filesIds) {
        const recipeFilesPromise = filesIds.map(id => RecipeFiles.createRecipeFiles(req.body.id, id))
        await Promise.all(recipeFilesPromise)
    }

    await Recipes.update(req.body)

    return res.redirect(`/admin/recipes/${req.body.id}`)
}

exports.delete = async function(req, res) {
    const { id } = req.body
    
    let results = await RecipeFiles.find(id)
    const files = results.rows
    
    const removeFilesPromise = files.map(file => RecipeFiles.delete(file.id))
    await Promise.all(removeFilesPromise)

    await Recipes.delete(id)

    return res.redirect('/admin/recipes')        
}