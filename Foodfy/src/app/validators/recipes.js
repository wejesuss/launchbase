const Recipes = require('../models/recipes')
const RecipeFiles = require('../models/filesRecipes')
const { addSrcToFilesArray } = require('../../lib/utils')

async function renderPaginate(page, limit) {
    try {
        page = page || 1
        limit = limit || 4
        
        let offset = limit * (page - 1)
        const params = {limit, offset}
    
        const recipes = await Recipes.paginate(params)
        
        if(!recipes[0]) return res.render("admin/recipes/index", {
            error: "Nenhuma receita encontrada!"
        })

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

function checkAllFields(body) {
    const keys = Object.keys(body)
    for (const key of keys) {
        if (body[key] == "" && key != "information" && key != "removed_files") {
            return {
                user: body,
                error: "Por favor preencha todos os campos."
            }
        }
    }
}

async function index(req, res, next) {
    let { page, limit } = req.query
    try {
        page = page || 1
        limit = limit || 4
    
        let { recipes, files, pagination } = await renderPaginate(page, limit)
        files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
        
        req.pageRecipes = {
            recipes,
            files,
            pagination
        }

        next() 
    } catch (err) {
        console.log(err)
        return res.redirect("/")
    }
}

async function post(req, res, next) {
    try {
        const options = await Recipes.recipeSelectOptions()

        let { recipes, files, pagination } = await renderPaginate(1, 4)
        files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
        req.recipesForErrorPage = { recipes, files, pagination }

        if(!options) return res.render("admin/recipes/index", {
            recipes,
            pagination: {},
            files,
            error: "Erro ao encontrar chefes!"
        })

        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/recipes/create", { checkedFields })

        if(req.files.length == 0) return res.render("admin/recipes/create", {
            recipe: req.body,
            chefs: options,
            error: "Envie ao menos uma imagem!"
        })

        next()
    } catch (err) {
        console.error(err)
    }
}

async function put(req, res, next) {
    const { removed_files } = req.body
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/recipes/edit", { checkedFields })
        
        if(removed_files) {
            const oldFiles = await RecipeFiles.find({ where: {recipe_id: req.body.id} })
    
            const removedFiles = removed_files.split(',')
            const lastIndex = removedFiles.length - 1
            removedFiles.splice(lastIndex, 1)
    
            const recipe = await Recipes.find({ where: {id: req.body.id} })
            let files = await RecipeFiles.find({ where: {recipe_id: recipe.id} })
            files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
    
            if ((req.files && req.files.length == 0) && removedFiles.length == oldFiles.length) {
                return res.render("admin/recipes/recipe", {
                    recipe,
                    files,
                    error: "Mande ao menos uma imagem!"
                })
            }
    
            const removedFilesPromise = removedFiles.map(id => RecipeFiles.delete(id))
                
            await Promise.all(removedFilesPromise)
        }
        
        next()
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    index,
    post,
    put
}