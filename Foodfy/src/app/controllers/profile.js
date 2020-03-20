const User = require('../models/users')
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

exports.show = async function(req, res) {
    const { userId: id } = req.session
    try {
        const user = await User.find({ where: {id} })
        if (!user) {
            req.session.destroy()
            return res.render("session/login", {
                error: "Usuário não encontrado!"
            })
        }

        return res.render("admin/profiles/profile", { user })
    } catch (err) {
        console.error(err)
        req.session.destroy()
        return res.render("session/login", {
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.put = async function(req, res) {
    const { userId: id } = req.session
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/profiles/profile", { ...checkedFields })

        let { name, email, password } = req.body
        const user = await User.find({ where: {id} })
        
        const isEqual = await compare(password, user.password)
        if(!isEqual) return res.render("admin/profiles/profile", {
            user: req.body,
            error: "Senha incorreta!"
        })

        await User.update(id, {
            name,
            email
        })

        return res.render("admin/profiles/profile", {
            user: req.body,
            success: "Usuário atualizado com sucesso!"
        })
    } catch (err) {
        console.error(err)
        return res.render("admin/profiles/profile", {
            user: req.body,
            error: "Algum erro aconteceu. Tente novamente!"
        })
    }
}