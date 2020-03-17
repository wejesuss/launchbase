const User = require('../models/users')
const { compare } = require('bcryptjs')

async function validateLogin(req, res, next) {
    let { email, password } = req.body

    const user = await User.find({ where: {email} })

    if(!user) return res.render("admin/session/login", {
        user: req.body,
        error: "Usuário não cadastrado!"
    })

    const passed = await compare(password, user.password)

    if(!passed) return res.render("admin/session/login", {
        user: req.body,
        error: "Senha incorreta."
    })

    req.user = user

    next()
}

module.exports = {
    validateLogin
}