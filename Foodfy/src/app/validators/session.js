const User = require('../models/users')
const { compare } = require('bcryptjs')

async function validateLogin(req, res, next) {
    let { email, password } = req.body

    const user = await User.find({ where: {email} })

    if(!user) return res.render("session/login", {
        user: req.body,
        error: "Usuário não cadastrado!"
    })

    const passed = await compare(password, user.password)

    if(!passed) return res.render("session/login", {
        user: req.body,
        error: "Senha incorreta."
    })

    req.user = user

    next()
}

async function validateForgot(req, res, next) {
    const { email } = req.body

    try {
        const user = await User.find({ where: {email} })

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

module.exports = {
    validateLogin,
    validateForgot
}