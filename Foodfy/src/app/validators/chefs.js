const Chefs = require('../models/chefs')
const ChefFiles = require('../models/filesChefs')
const { createSrc } = require('../../lib/utils')

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

async function listChefs(req, res, next) {
    let { page, limit } = req.query
    try {
        page = page || 1
        limit = limit || 8

        let { chefs, pagination } = await chefsPaginate(page, limit)
        
        const chefsPromise = chefs.map(async chef => {
            const file = await ChefFiles.find({ where: {file_id: chef.file_id} })

            if(file)
                chef.avatar_url = createSrc(file, req.protocol, req.headers.host)
        })
        await Promise.all(chefsPromise)
        
        req.loadChefs = {
            chefs,
            pagination
        }

        next()
    } catch (err) {
        console.error(err)
    }
}

async function post(req, res, next) {
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/chefs/create", { ...checkedFields })

        if(!req.file) return res.render("admin/chefs/create", {
            chef: req.body,
            error: "Mande uma imagem por favor!"
        })

        next()
    } catch (err) {
        console.error(err)
    }
}

async function show(req, res, next) {
    const { id } = req.params
    try {
        const chef = await Chefs.find(id)
    
        let {chefs, pagination} = await chefsPaginate(1, 8)
        const chefsPromise = chefs.map(async chef => {
            const file = await ChefFiles.find({ where: {file_id: chef.file_id} })
    
            if(file)
                chef.avatar_url = createSrc(file, req.protocol, req.headers.host)
        })
        
        await Promise.all(chefsPromise)
    
        if (!chef) {
            req.listChefs = { chefs, pagination }
            req.error = { message: "Chefe não encontrado!" }
        } else {
            const file = await ChefFiles.find({ where: {file_id: chef.file_id} })
            
            if(file)
            chef.avatar_url = createSrc(file, req.protocol, req.headers.host)
            
            req.chef = chef
        }
        
        next()
    } catch (err) {
        console.error(err)
    }
}

async function put(req, res, next) {
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/chefs/edit", { ...checkedFields })
        
        const chef = await Chefs.find(req.body.id)
        const hasFile = await ChefFiles.find({ where: {file_id: chef.file_id} })
        
        if(hasFile)
            hasFile.src = createSrc(hasFile, req.protocol, req.headers.host)
        
        if(req.body.removed_files && !req.file) return res.render(`admin/chefs/edit`, { 
            chef, 
            file: hasFile,
            error: "Chefe não pode ficar sem foto!"
        }) 

        next()
    } catch (err) {
        console.log(err)
    }
}

async function chefDelete(req, res, next) {
    const { id: chef_id, file_id } = req.body
    try {
        const recipes = await Chefs.selectRecipesById(chef_id)

        if(file_id == '') file_id = null
        const file = await ChefFiles.find({ where: {file_id: file_id} })
        if(file)
            file.src = createSrc(file, req.protocol, req.headers.host)

        if(recipes[0]) {
            return res.render("admin/chefs/edit", {
                chef: req.body,
                file,
                error: "Não pode excluir chefes que possuem receitas!"
            })
        }

        next()
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    post,
    show,
    put,
    chefDelete,
    listChefs
}