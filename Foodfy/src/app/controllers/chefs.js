const Chefs = require('../models/chefs')
const User = require('../models/users')
const ChefFiles = require('../models/filesChefs')
const { addSrcToFilesArray } = require('../../lib/utils')

function checkAllFields(body) {
    const keys = Object.keys(body)

    for (const key of keys) {
        if (body[key] == "" && key != "file_id" &&  key != "removed_files") {
            return {
                user: body,
                error: "Por favor preencha todos os campos."
            }
        }
    }
}

async function loadPaginate(page, limit) {
    
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
}

exports.index = async function(req, res) {
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

    return res.render('admin/chefs/index', { chefs, pagination })
}

exports.create = function(req, res) {
    return res.render('admin/chefs/create')
}

exports.post = async function(req, res) {
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/chefs/create", { checkedFields })

        if(!req.file) return res.render("admin/chefs/create", {
            chef: req.body,
            error: "Mande uma imagem por favor!"
        })

        const fileId = await ChefFiles.create({...req.file})

        if(fileId) {
            const chefId = await Chefs.create(req.body.name, fileId)
            
            return res.redirect(`/admin/chefs/${chefId}`)
        }
    } catch (err) {
        console.error(err)
        return res.render("admin/chefs/create", {
            chef: req.body,
            error: "Algum erro ocorreu, tente novamente!"
        })
    }
}

exports.show = async function(req, res) {
    const { id } = req.params
    const { userId } = req.session

    if (!userId) 
        return res.redirect("/users/login")

    const chef = await Chefs.find(id)
    
    let {chefs, pagination} = await loadPaginate(1, 8)
    const chefsPromise = chefs.map(async chef => {
        const file = await ChefFiles.find({ where: {file_id: chef.file_id} })

        if(file)
            chef.avatar_url = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    })
    
    await Promise.all(chefsPromise)

    if (!chef) return res.render("admin/chefs/index", {
        chefs,
        pagination,
        error: "Chefe não encontrado!"
    })

    const file = await ChefFiles.find({ where: {file_id: chef.file_id} })

    if(file)
        chef.avatar_url = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`

    const recipes = await Chefs.selectRecipesById(id)
    
    const searchFilesPromise = recipes.map(recipe => ChefFiles.findRecipesFiles(recipe.id))
    let files = await Promise.all(searchFilesPromise)
    files = files.reduce((imagesArray, currentImage) => {
        if(currentImage.rows[0]) imagesArray.push(currentImage.rows[0])

        return imagesArray
    }, [])

    files = await addSrcToFilesArray(files, req.protocol, req.headers.host)

    return res.render('admin/chefs/chef', { chef, recipes, files })
}

exports.edit = async function(req, res) {
    const { id } = req.params
    
    const chef = await Chefs.find(id)
    
    let {chefs, pagination} = await loadPaginate(1, 8)
    const chefsPromise = chefs.map(async chef => {
        const file = await ChefFiles.find({ where: {file_id: chef.file_id} })

        if(file)
            chef.avatar_url = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    })
    
    await Promise.all(chefsPromise)

    if (!chef) return res.render("admin/chefs/index", {
        chefs,
        pagination,
        error: "Chefe não encontrado!"
    })

    const file = await ChefFiles.find({ where: {file_id: chef.file_id} })
    
    if(file)
        file.src = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`

    return res.render(`admin/chefs/edit`, { chef, file })
}

exports.put = async function(req, res) {
    const checkedFields = checkAllFields(req.body)
    if(checkedFields) return res.render("admin/chefs/edit", { checkedFields })

    if(req.body.removed_files) {
        const removed_files = req.body.removed_files.split(',')
        const lasIndex = removed_files.length - 1
        removed_files.splice(lasIndex, 1)

        const removedFilesPromise = removed_files.map(id => ChefFiles.delete(req.body.id, id))
            
        await Promise.all(removedFilesPromise)

        req.body.file_id = null
    }
    
    if (req.body.file_id == '') req.body.file_id = null
    const file = await ChefFiles.find({ where: {file_id: req.body.file_id} })

    let fileId
    if(!file && req.file) {
        fileId = await ChefFiles.create({...req.file})
    }
    
    if(!fileId) fileId = req.body.file_id

    await Chefs.update(req.body.name, fileId, req.body.id)
    
    return res.redirect(`/admin/chefs/${req.body.id}/edit`)
}

exports.delete = async function(req, res) {
    const { id: chef_id, file_id } = req.body

    const recipes = await Chefs.selectRecipesById(chef_id)
    
    if(recipes[0]) {
        return res.render("admin/chefs/edit", {
            chef: req.body,
            error: "Não pode excluir chefes que possuem receitas!"
        })
    } else {
        if(file_id == '') file_id = null

        await ChefFiles.delete(chef_id, file_id)

        await Chefs.delete(chef_id)

        let {chefs, pagination} = await loadPaginate(1, 8)
        const chefsPromise = chefs.map(async chef => {
            const file = await ChefFiles.find({ where: {file_id: chef.file_id} })
    
            if(file)
                chef.avatar_url = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        })
        
        await Promise.all(chefsPromise)

        return res.render("admin/chefs/index", {
            chefs,
            pagination,
            success: "Chefe deletado com sucesso!"
        })
    }
}