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

async function post(req, res, next) {
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/chefs/create", { checkedFields })

        if(!req.file) return res.render("admin/chefs/create", {
            chef: req.body,
            error: "Mande uma imagem por favor!"
        })

        next()
    } catch (err) {
        console.error(err)
    }
}

async function put(req, res, next) {
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/recipes/edit", { checkedFields })
        
        const chef = await Chefs.find(req.body.id)
        const hasFile = await ChefFiles.find({ where: {file_id: chef.file_id} })
        
        if(hasFile)
            hasFile.src = `${req.protocol}://${req.headers.host}${hasFile.path.replace("public", "")}`
        
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

module.exports = {
    post,
    put
}