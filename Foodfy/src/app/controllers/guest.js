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
    let results = await Recipes.findByLimit(limit)
    const recipes = results.rows

    const searchFilesPromise = recipes.map(recipe => RecipeFiles.find(recipe.id))
    let files = await Promise.all(searchFilesPromise)
    files = files.reduce((imagesArray, currentImage) => {
        if(currentImage.rows[0]) imagesArray.push(currentImage.rows[0])

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

    return res.render("guest/recipes", { recipes, filter, pagination, files, searchForm})
}

exports.show = async function(req, res) {
    const { id } = req.params

    let results = await Recipes.find(id)
    const recipe = results.rows[0]

    if(!recipe) {
        return res.send("Recipe not found!")
    }

    results = await RecipeFiles.find(recipe.id)
    let files = results.rows
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)

    return res.render("guest/recipe", { recipe, files, searchForm })
}

exports.listChefs = async function(req, res) {
    let { page, limit } = req.query
    page = page || 1
    limit = limit || 8
    
    let offset = limit * (page - 1)
    const params = {limit, offset}

    let results = await Chefs.paginate(params)
    const chefs = results.rows

    let pagination
    if(chefs[0]) {
        pagination = {
            total: Math.ceil(chefs[0].total / limit),
            page,
            limit
        }
    }

    const chefsPromise = chefs.map(async chef => {
        results = await ChefFiles.find(chef.file_id)
        const file = results.rows[0]

        if(file)
            chef.avatar_url = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    })
    
    await Promise.all(chefsPromise)

    return res.render("guest/chefs", { chefs, pagination })
}