const Chefs = require('../models/chefs')
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

exports.index = async function(req, res) {
    let { page, limit } = req.query
    try {
        page = page || 1
        limit = limit || 8

        let { chefs, pagination } = await loadPaginate(page, limit)
        
        const chefsPromise = chefs.map(async chef => {
            const file = await ChefFiles.find({ where: {file_id: chef.file_id} })
    
            if(file)
                chef.avatar_url = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        })

        await Promise.all(chefsPromise)

        return res.render('admin/chefs/index', { 
            chefs, 
            pagination
        })
    } catch (err) {
        console.error(err)
        return res.render("admin/chefs/index", {
            error: "Chefes não encontrados!"
        })
    }
}

exports.create = function(req, res) {
    try {
        return res.render('admin/chefs/create')
    } catch (err) {
        console.error(err)
    }
}

exports.post = async function(req, res) {
    try {
        const fileId = await ChefFiles.create({...req.file})

        if(fileId) {
            await Chefs.create(req.body.name, fileId)
            
            let { chefs } = await loadPaginate(1, 8)
            const chefsPromise = chefs.map(async chef => {
                const file = await ChefFiles.find({ where: {file_id: chef.file_id} })
        
                if(file)
                    chef.avatar_url = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            })

            await Promise.all(chefsPromise)
            return res.render('admin/chefs/index', { 
                chefs, 
                pagination: {},
                success: "Chefe criado com sucesso!"
            })
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
    try {
        const chef = await Chefs.find(id)
        let { chefs } = await loadPaginate(1, 8)
        const chefsPromise = chefs.map(async chef => {
            const file = await ChefFiles.find({ where: {file_id: chef.file_id} })
    
            if(file)
                chef.avatar_url = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        })
        
        await Promise.all(chefsPromise)
    
        if (!chef) return res.render("admin/chefs/index", {
            chefs,
            pagination: {},
            error: "Chefe não encontrado!"
        })
    
        const file = await ChefFiles.find({ where: {file_id: chef.file_id} })
        
        if(file)
            file.src = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    
        return res.render(`admin/chefs/edit`, { chef, file })   
    } catch (err) {
        console.error(err)
    }
}

exports.put = async function(req, res) {
    try {
        if(req.body.removed_files) {
            const removed_files = req.body.removed_files.split(',')
            const lasIndex = removed_files.length - 1
            removed_files.splice(lasIndex, 1)
    
            const removedFilesPromise = removed_files.map(id => ChefFiles.delete(req.body.id, id))
                
            await Promise.all(removedFilesPromise)
        }

        if (req.body.file_id == '') req.body.file_id = null
        const file = await ChefFiles.find({ where: {file_id: req.body.file_id} })
    
        let fileId
        if(!file && req.file) {
            fileId = await ChefFiles.create({...req.file})
        }
        
        if(!fileId) fileId = req.body.file_id
    
        await Chefs.update(req.body.name, fileId, req.body.id)
        
        const chef = await Chefs.find(req.body.id)
        const newFile = await ChefFiles.find({ where: {file_id: chef.file_id} })
        if(newFile)
            newFile.src = `${req.protocol}://${req.headers.host}${newFile.path.replace("public", "")}`

        return res.render(`admin/chefs/edit`, { 
            chef, 
            file: newFile,
            success: "Chefe atualizado com sucesso!"
        }) 
    } catch (err) {
        console.log(err)
        return res.render(`admin/chefs/edit`, {
            chef: req.body,
            error: "Algum erro ocorreu, tente novamente!"
        })
    }
}

exports.delete = async function(req, res) {
    const { id: chef_id, file_id } = req.body
    try {
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
    } catch (err) {
        console.error(err)
    }
}