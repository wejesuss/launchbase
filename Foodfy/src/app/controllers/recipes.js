const Recipes = require('../models/recipes')
const RecipeFiles = require('../models/filesRecipes')
const { addSrcToFilesArray } = require('../../lib/utils')

async function renderPaginate(page, limit) {
    try {
        let offset = limit * (page - 1)
        const params = {limit, offset}
    
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

exports.index = async function(req, res) {
    let { recipes, files, pagination } = req.pageRecipes
    try {
        return res.render("admin/recipes/index", { 
            recipes, 
            pagination, 
            files 
        })
    } catch (err) {
        console.log(err)
        return res.redirect("/")
    }
}

exports.create = async function(req, res) {
    try {
        const options = await Recipes.recipeSelectOptions()

        let { recipes, files } = await renderPaginate(1, 4)
        files = await addSrcToFilesArray(files, req.protocol, req.headers.host)

        if(!options) return res.render("admin/recipes/index", {
            recipes,
            pagination: {},
            files,
            error: "Erro ao encontrar chefes!"
        })
    
        return res.render('admin/recipes/create', {chefs: options})
    } catch (err) {
        console.error(err)
        return res.redirect("/admin/recipes")
    }
}

exports.post = async function(req, res) {
    const { recipesForErrorPage } = req
    try {
        const filesPromise = req.files.map(file => RecipeFiles.create({...file}))
        let filesIds = await Promise.all(filesPromise)
        
        filesIds = filesIds.map(file => (file.rows[0].id)).sort()
    
        req.body.user_id = req.session.userId
        let results = await Recipes.create(req.body)
        const recipeId = results.rows[0].id
    
        const recipeFilesPromise = filesIds.map(id => RecipeFiles.createRecipeFiles(recipeId, id))
        await Promise.all(recipeFilesPromise)
    
        let { recipes, pagination, files } = await renderPaginate(1, 4)
        files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
    
        return res.render(`admin/recipes/index`, {
            recipes,
            pagination,
            files,
            success: "Receita criada com sucesso!"
        })   
    } catch (err) {
        console.log(err)
        return res.render("admin/recipes/index", {
            recipes: recipesForErrorPage.recipes,
            pagination: {},
            files: recipesForErrorPage.files,
            error: "Erro ao criar receita! Tente novamente mais tarde."
        })
    }
}

exports.show = async function(req, res) {
    const { id } = req.params
    const recipe = await Recipes.find({ where: {id} })
    
    let { recipes, files } = await renderPaginate(1, 4)
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
    if (!recipe) return res.render(`admin/recipes/index`, {
        recipes,
        pagination: {},
        files,
        error: "Receita não encontrada!"
    })

    files = await RecipeFiles.find({ where: {recipe_id: recipe.id} })
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)

    return res.render("admin/recipes/recipe", {recipe, files})
}

exports.edit = async function(req, res) {
    const { id } = req.params
    
    const recipe = await Recipes.find({ where: {id} })
    
    let { recipes, files } = await renderPaginate(1, 4)
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
    if (!recipe) return res.render(`admin/recipes/index`, {
        recipes,
        pagination: {},
        files,
        error: "Receita não encontrada!"
    })

    files = await RecipeFiles.find({ where: {recipe_id: recipe.id} })
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
    
    const options = await Recipes.recipeSelectOptions()
    if(!options) return res.render("admin/recipes/index", {
        recipes,
        pagination: {},
        files,
        error: "Erro ao encontrar chefes!"
    })

    return res.render('admin/recipes/edit', { recipe, chefs: options, files })
}

exports.put = async function(req, res) {
    let { recipes, files } = await renderPaginate(1, 4)
    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
    try {
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
    
        const recipe = await Recipes.find({ where: {id: req.body.id} })
        let files = await RecipeFiles.find({ where: {recipe_id: recipe.id} })
        files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
        return res.render("admin/recipes/recipe", {
            recipe,
            files,
            success: "Receita atualizada com sucesso!"
        })    
    } catch (err) {
        console.log(err)
        return res.render("admin/recipes/index", {
            recipes,
            files,
            pagination: {},
            error: "Algum erro inesperado ocorreu!"
        })   
    }
}

exports.delete = async function(req, res) {
    const { id } = req.body
    
    const files = await RecipeFiles.find({ where: {recipe_id: id} })
    
    const removeFilesPromise = files.map(file => RecipeFiles.delete(file.id))
    await Promise.all(removeFilesPromise)

    await Recipes.delete(id)

    let { recipes, files: recipesFiles } = await renderPaginate(1, 4)
    recipesFiles = await addSrcToFilesArray(recipesFiles, req.protocol, req.headers.host)

    return res.render("admin/recipes/index", {
        recipes,
        files: recipesFiles,
        pagination: {},
        success: "Receita deletada com sucesso!"
    })      
}