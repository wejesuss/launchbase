const User = require('../models/User')
const { compare } = require('bcryptjs')

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

    const user = await User.findOne({ where: {id} })

    if(!user) return res.render("user/register", {
        error: "Usuário não encontrado!"
    })    

    req.user = user

    next()
}

async function post(req, res, next) {
    const checkFieldsError = checkAllFields(req.body)

    if(checkFieldsError) return res.render("user/register", { checkFieldsError })

    let { email, cpf_cnpj, password, passwordRepeat } = req.body

    cpf_cnpj = cpf_cnpj.replace(/\D/g, "")
    const user = await User.findOne({
        where: {email},
        or: {cpf_cnpj}
    })

    if(user) return res.render("user/register", {
        user: req.body,
        error: "Usuário já existe."
    })

    if(password != passwordRepeat) return res.render("user/register", {
        user: req.body,
        error: "Senhas não coincidem."
    })

    next()
}

async function update(req, res, next) {
    const checkFieldsError = checkAllFields(req.body)

    if(checkFieldsError) return res.render("user/index", checkFieldsError)

    let { id, password } = req.body

    if (!password) return res.render("user/index", {
        user: req.body,
        error: "Por favor digite uma senha."
    })

    const user = await User.findOne({ where: {id} })

    const passed = await compare(password, user.password)

    if(!passed) return res.render("user/index", {
        user: req.body,
        error: "Senha incorreta."
    })

    req.user = user

    next()
}

async function forgot(req, res, next) {
    const { email } = req.body

    try {
        const user = await User.findOne({ where: {email} })

        if(!user) return res.render("session/forgot-password", {
            user: req.body,
            error: "Email não cadastrado!"
        })
        
        req.user = user
        
        next()
    } catch (err) {
        console.error(err)
    }
}

async function reset(req, res, next) {
    const { email, password, passwordRepeat, token } = req.body
    
    try {
        const user = await User.findOne({ where: { email } })

        if(!user) return res.render("session/password-reset", {
            user: req.body,
            token,
            error: "Usuário não encontrado!"
        })  

        if(password != passwordRepeat) return res.render("session/password-reset", {
            user: req.body,
            token,
            error: "Senhas não coincidem."
        })

        if(token != user.reset_token) return res.render("session/password-reset", {
            user: req.body,
            token,
            error: "Token inválido. Solicite um novo, ou tente novamente!"
        })

        let now = new Date()
        now = now.setHours(now.getHours())

        if(now > user.reset_token_expires) return res.render("session/password-reset", {
            user: req.body,
            token,
            error: "Token expirado, solicite uma nova recuperação de senha!"
        })

        req.user = user

        next()
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    post,
    show,
    update,
    forgot,
    reset
}