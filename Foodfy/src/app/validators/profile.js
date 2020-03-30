const { compare } = require('bcryptjs')

const User = require('../models/users')
const RecipeFiles = require('../models/filesRecipes')

const { addSrcToFilesArray } = require('../../lib/utils')

function checkAllFields(body) {
    const keys = Object.keys(body)

    for (const key of keys) {
        if (body[key] == "") {
            return {
                user: body,
                error: "Por favor preencha todos os campos."
            }
        }
    }
}

async function show(req, res, next) {
    const { userId: id } = req.session
    try {
        const user = await User.findOne({ where: {id} })
        if (!user) {
            req.session.destroy()
            return res.render("session/login", {
                error: "Usuário não encontrado!"
            })
        }

        req.user = user

        next()
    } catch (err) {
        console.error(err)
        req.session.destroy()
        return res.render("session/login", {
            error: "Erro inesperado, tente novamente!"
        })
    }
}

async function put(req, res, next) {
    const { userId: id } = req.session
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/profiles/profile", { ...checkedFields })

        let { email, password } = req.body
        const user = await User.findOne({ where: {id} })
        const otherUser = await User.findOne({ where: {email} })
        
        const isEqual = await compare(password, user.password)
        if(!isEqual) return res.render("admin/profiles/profile", {
            user: req.body,
            error: "Senha incorreta!"
        })

        if(otherUser && otherUser.id != id) return res.render("admin/profiles/profile", {
            user: { ...req.body, email: user.email },
            error: "Email já cadastrado!"
        })

        next()
    } catch (err) {
        console.error(err)
        return res.render("admin/profiles/profile", {
            user: req.body,
            error: "Algum erro aconteceu. Tente novamente!"
        })
    }
}

async function myRecipes(req, res, next) {
    let { page, limit } = req.query
    const { userId: user_id } = req.session
    try {
        page = page || 1
        limit = limit || 4
        let offset = limit * (page - 1)
        let params = {limit, offset, user_id}

        const recipes = await User.listRecipes(params)
        
        if(!recipes[0]) return res.render("admin/recipes/index", { error: "Nenhuma receita encontrada!" })

        let pagination
        if(recipes[0]) {
            pagination = {
                total: Math.ceil(recipes[0].total / limit),
                page,
                limit
            }
        }

        const searchFilesPromise = recipes.map(recipe => RecipeFiles.findAll({ where: {recipe_id: recipe.id} }))
        let files = await Promise.all(searchFilesPromise)
        files = files.reduce((imagesArray, currentImage) => {
            if(currentImage[0]) imagesArray.push(currentImage[0])

            return imagesArray
        }, [])
        files = await addSrcToFilesArray(files, req.protocol, req.headers.host)
        
        req.pageRecipes = {
            recipes,
            pagination,
            files
        }

        next() 
    } catch (err) {
        console.log(err)
        return res.redirect("/admin")
    }
}

module.exports = {
    show,
    put,
    myRecipes
}