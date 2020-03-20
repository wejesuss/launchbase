const Recipes = require('../models/recipes')
const RecipeFiles = require('../models/filesRecipes')
const Chefs = require('../models/chefs')
const ChefFiles = require('../models/filesChefs')
const { addSrcToFilesArray } = require('../../lib/utils')

const searchForm = true

async function chefsPaginate(page, limit) {
    try {
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

        return { chefs, pagination }   
    } catch (err) {
        console.error(err)
    }
}

async function recipesPaginate(page, limit, filter) {
    try {        
        let offset = limit * (page - 1)
        let params
        (filter != null) ? params = { limit, offset, filter } : params = { limit, offset }
    
        const recipes = await Recipes.paginate(params)
        
        if(!recipes[0]) return {
            error: "Nenhuma receita encontrada!"
        }

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
        
        return {
            recipes,
            pagination,
            files
        }
    } catch (err) {
        console.error(err)
    }
}

exports.index = async function(req, res) {
    const home = {
        title:"As melhores receitas",
        presentation:"Aprenda a construir os melhores pratos com receitas criadas por profissionais do mundo inteiro.",
        chef_url:'/images/layouts/assets/chef.png'        
    }
    try {
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
    } catch (err) {
        console.error(err)
        return res.render("guest/home", {
            home,
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.list = async function(req, res) {
    let { filter, page, limit } = req.query
    try {
        page = page || 1
        limit = limit || 3
        
        let { error, recipes, pagination, files } = await recipesPaginate(page, limit, filter)
        if(error) return res.render("guest/recipes", { error })

        files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
        
        return res.render("guest/recipes", { recipes, filter, pagination, files, searchForm})   
    } catch (err) {
        console.error(err)
        return res.render("guest/recipes", {
            searchForm,
            filter,
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.show = async function(req, res) {
    const { id } = req.params
    try {
        let { recipes, pagination, files } = await recipesPaginate(1, 3, null)
        files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
        
        const recipe = await Recipes.find({ where: {id} })
        if(!recipe) return res.render("guest/recipes", {
            recipes,
            pagination,
            error: "Receita não encontrada!"
        })
    
        let recipeFiles = await RecipeFiles.find({ where: {recipe_id: recipe.id} })
        recipeFiles = await addSrcToFilesArray(recipeFiles, req.protocol, req.headers.host)
    
        return res.render("guest/recipe", { recipe, files: recipeFiles, searchForm })
    } catch (err) {
        console.error(err)
        return res.render("guest/recipe", {
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.showChef = async function(req, res) {
    const { id } = req.params
    try {
        const { error, listChefs, chef } = req

        if (error) return res.render("guest/chefs", {
            chefs: listChefs.chefs,
            pagination: listChefs.pagination,
            error: error.message
        })

        const recipes = await Chefs.selectRecipesById(id)
        
        const searchFilesPromise = recipes.map(recipe => ChefFiles.findRecipesFiles(recipe.id))
        let files = await Promise.all(searchFilesPromise)
        files = files.reduce((imagesArray, currentImage) => {
            if(currentImage.rows[0]) imagesArray.push(currentImage.rows[0])
    
            return imagesArray
        }, [])
    
        files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
    
        return res.render('guest/chef', { chef, recipes, files })   
    } catch (err) {
        console.error(err)
        return res.render("guest/chefs", {
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.listChefs = async function(req, res) {
    let { chefs, pagination } = req.loadChefs
    try {
        if(!chefs[0]) return res.render("guest/chefs", { error: "Chefes não encontrados!"})

        return res.render('guest/chefs', { 
            chefs, 
            pagination
        })
    } catch (err) {
        console.error(err)
        return res.render("guest/chefs", {
            chefs,
            pagination,
            error: "Erro inesperado, tente novamente!"
        })
    }
}