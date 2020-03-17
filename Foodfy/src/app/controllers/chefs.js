const Chefs = require('../models/chefs')
const ChefFiles = require('../models/filesChefs')
const { addSrcToFilesArray } = require('../../lib/utils')

exports.index = async function(req, res) {
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

    return res.render('admin/chefs/index', { chefs, pagination })
}

exports.create = function(req, res) {
    return res.render('admin/chefs/create')
}

exports.post = async function(req, res) {
    const keys = Object.keys(req.body)
    
    for (const key of keys) {
        if (req.body[key] == "") {
            return res.send("Please, fill in all fields")
        }
    }

    if(!req.file) return res.send("Please send one image!")
    
    let results = await ChefFiles.create({...req.file})
    const fileId = results.rows[0].id

    if(fileId) {
        results = await Chefs.create(req.body.name, fileId)
        const chefId = results.rows[0].id
        
        return res.redirect(`/admin/chefs/${chefId}`)
    }
}

exports.show = async function(req, res) {
    const { id } = req.params
    
    let results = await Chefs.find(id)
    const chef = results.rows[0]
    
    if (!chef) return res.send("Chef not found!")

    results = await ChefFiles.find(chef.file_id)
    const file = results.rows[0]

    if(file)
        chef.avatar_url = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`

    results = await Chefs.selectRecipesById(id)
    const recipes = results.rows
    
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
    
    let results = await Chefs.find(id)
    const chef = results.rows[0]
    
    if (!chef) return res.send("Chef not found!")

    results = await ChefFiles.find(chef.file_id)
    const file = results.rows[0]
    
    if(file)
        file.src = `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`

    return res.render(`admin/chefs/edit`, { chef, file })
}

exports.put = async function(req, res) {
    const keys = Object.keys(req.body)
    
    for (const key of keys) {
        if (req.body[key] == "" && key != "file_id" &&  key != "removed_files") {
            return res.send("Please, fill in all fields")
        }
    }

    if(req.body.removed_files) {
        const removed_files = req.body.removed_files.split(',')
        const lasIndex = removed_files.length - 1
        removed_files.splice(lasIndex, 1)

        const removedFilesPromise = removed_files.map(id => ChefFiles.delete(req.body.id, id))
            
        await Promise.all(removedFilesPromise)

        req.body.file_id = null
    }
    
    if (req.body.file_id == '') req.body.file_id = null
    const oldFile = (await ChefFiles.find(req.body.file_id)).rows.length

    let fileId
    if(oldFile < 1 && req.file) {
        let results = await ChefFiles.create({...req.file})
        fileId = results.rows[0].id
    }
    
    if(!fileId) fileId = req.body.file_id

    await Chefs.update(req.body.name, fileId, req.body.id)
    
    return res.redirect(`/admin/chefs/${req.body.id}/edit`)
}

exports.delete = async function(req, res) {
    const { id: chef_id, file_id } = req.body

    let results = await Chefs.selectRecipesById(chef_id)
    const recipes = results.rows[0]
    
    if(recipes)
        return res.send("Unable to exclude chefs with at least one recipe")
    else {
        if(file_id == '') file_id = null

        await ChefFiles.delete(chef_id, file_id)

        await Chefs.delete(chef_id)

        return res.redirect('/admin/chefs')
    }
    
}