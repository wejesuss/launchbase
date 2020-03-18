const Recipes = require('../models/recipes')
const RecipeFiles = require('../models/filesRecipes')
const { addSrcToFilesArray } = require('../../lib/utils')

exports.index = async function(req, res) {
    let { page, limit } = req.query
    page = page || 1
    limit = limit || 4
    
    let offset = limit * (page - 1)
    const params = {limit, offset}

    const recipes = await Recipes.paginate(params)
    
    let pagination
    if(recipes[0]) {
        pagination = {
            total: Math.ceil(recipes[0].total / limit),
            page,
            limit
        }
    }

    const searchFilesPromise = recipes.map(recipe => RecipeFiles.find({ where: {recipe_id: recipe.id} }))
    let files = await Promise.all(searchFilesPromise)
    files = files.reduce((imagesArray, currentImage) => {
        if(currentImage[0]) imagesArray.push(currentImage[0])

        return imagesArray
    }, [])

    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)

    return res.render("admin/recipes/index", { recipes, pagination, files })
}

exports.create = async function(req, res) {
    const options = await Recipes.recipeSelectOptions()

    if(!options) return res.redirect("/admin/recipes")

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

    req.body.user_id = req.session.userId
    let results = await Recipes.create(req.body)
    const recipeId = results.rows[0].id

    const recipeFilesPromise = filesIds.map(id => RecipeFiles.createRecipeFiles(recipeId, id))
    await Promise.all(recipeFilesPromise)

    return res.redirect(`/admin/recipes/${recipeId}`)
}

exports.show = async function(req, res) {
    const { id } = req.params

    const recipe = await Recipes.find({ where: {id} })

    if (!recipe) return res.send("Recipe not found!")

    let files = await RecipeFiles.find({ where: {recipe_id: recipe.id} })
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)

    return res.render("admin/recipes/recipe", {recipe, files})
}

exports.edit = async function(req, res) {
    const { id } = req.params
    
    const recipe = await Recipes.find({ where: {id} })

    if (!recipe) return res.send("Recipe not found!")

    let files = await RecipeFiles.find({ where: {recipe_id: recipe.id} })
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
    
    const options = await Recipes.recipeSelectOptions()

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
        const oldFiles = await RecipeFiles.find({ where: {recipe_id: req.body.id} })

        const removedFiles = removed_files.split(',')
        const lastIndex = removedFiles.length - 1
        removedFiles.splice(lastIndex, 1)

        if ((req.files && req.files.length == 0) && removedFiles.length == oldFiles.length) {
            return res.render("admin/recipes/edit", {
                recipe: req.body,
                files: req.files,
                error: "Mande ao menos uma imagem!"
            })
        }

        const removedFilesPromise = removedFiles.map(id => RecipeFiles.delete(id))
            
        await Promise.all(removedFilesPromise)
    }

    let filesIds
    if(req.files.length != 0) {
        const oldFiles = await RecipeFiles.find({ where: {recipe_id: req.body.id} })
        const totalFiles = oldFiles.length + req.files.length

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
    
    const files = await RecipeFiles.find({ where: {recipe_id: id} })
    
    const removeFilesPromise = files.map(file => RecipeFiles.delete(file.id))
    await Promise.all(removeFilesPromise)

    await Recipes.delete(id)

    return res.redirect('/admin/recipes')        
}