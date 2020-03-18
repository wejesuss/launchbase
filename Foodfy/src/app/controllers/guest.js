const Recipes = require('../models/recipes')
const RecipeFiles = require('../models/filesRecipes')
const Chefs = require('../models/chefs')
const ChefFiles = require('../models/filesChefs')
const { addSrcToFilesArray } = require('../../lib/utils')

const searchForm = true
exports.index = async function(req, res) {
    const home = {
        title:"As melhores receitas",
        presentation:"Aprenda a construir os melhores pratos com receitas criadas por profissionais do mundo inteiro.",
        chef_url:'/images/layouts/assets/chef.png'        
    }

    const limit = 6
    const recipes = await Recipes.findByLimit(limit)

    const searchFilesPromise = recipes.map(recipe => RecipeFiles.find({ where: {recipe_id: recipe.id} }))
    let files = await Promise.all(searchFilesPromise)
    files = files.reduce((imagesArray, currentImage) => {
        if(currentImage[0]) imagesArray.push(currentImage[0])

        return imagesArray
    }, [])

    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)

    return res.render("guest/home", { home, recipes, files, searchForm })
}

exports.list = async function(req, res) {
    let { filter, page, limit } = req.query
    page = page || 1
    limit = limit || 3
    
    let offset = limit * (page - 1)

    const params = {
        filter,
        limit,
        offset
    }

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

    return res.render("guest/recipes", { recipes, filter, pagination, files, searchForm})
}

exports.show = async function(req, res) {
    const { id } = req.params

    const recipe = await Recipes.find({ where: {id} })

    if(!recipe) {
        return res.send("Recipe not found!")
    }

    let files = await RecipeFiles.find({ where: {recipe_id: recipe.id} })
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)

    return res.render("guest/recipe", { recipe, files, searchForm })
}

exports.listChefs = async function(req, res) {
    let { page, limit } = req.query
    page = page || 1
    limit = limit || 8
    
    let offset = limit * (page - 1)
    const params = {limit, offset}

    const chefs = await Chefs.paginate(params)

    let pagination
    if(chefs[0]) {
        pagination = {
            total: Math.ceil(chefs[0].total / limit),
            page,
            limit
        }
    }

    const chefsPromise = chefs.map(async chef => {
        const file = await ChefFiles.find({ where: {file_id: chef.file_id} })

        if(file)
            chef.avatar_url = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    })
    
    await Promise.all(chefsPromise)

    return res.render("guest/chefs", { chefs, pagination })
}