const crypto = require('crypto')
const mailer = require('../../lib/mailer')
const User = require('../models/User')
const { hash } = require('bcryptjs')

module.exports = {
    loginForm(req, res) {
        try {
            return res.render("session/login")
        } catch (err) {
            console.error(err)
        }
    },
    login(req, res) {
        req.session.userId = req.user.id
        try {
            return res.redirect("/users")
        } catch (err) {
            console.error(err)
        }
    },
    logout(req, res) {
        try {
            req.session.destroy()
            return res.redirect("/")
        } catch (err) {
            console.error(err)
        }
    },
    forgotForm(req, res) {
        try {
            return res.render("session/forgot-password")
        } catch (err) {
            console.error(err)
        }
    },
    async forgot(req, res) {
        const user = req.user
        try {
            const token = crypto.randomBytes(20).toString("hex")
            
            let tokenExpires = new Date()
            tokenExpires = tokenExpires.setHours(tokenExpires.getHours() + 1)

            await User.update(user.id, {
                reset_token: token,
                reset_token_expires: tokenExpires
            })

            await mailer.sendMail({
                to: user.email,
                from: "no-reply@rocketseat.com.br",
                subject: 'Recuperação de senha.',
                html: `<h2>Perdeu a senha?</h2>
                <p>Não se preocupe, clique no link abaixo para recuperar sua senha.</p>
                <p>
                    <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
                    RECUPERAR SENHA
                    </a>
                </p>
                `
            })

            return res.render("session/forgot-password", {
                success: "Verifique seu email para prosseguir!"
            })
        } catch (err) {
            console.error(err)
            return res.render("session/forgot-password", {
                error: "Erro inesperado, tente novamente!"
            })
        }
    },
    resetForm(req, res) {
        try {
            return res.render("session/password-reset", { token: req.query.token })
        } catch (err) {
            console.error(err)
        }
    },
    async reset(req, res) {
        const user = req.user

        const { password, token } = req.body
        try {
            const newPassword = await hash(password, 8)

            await User.update(user.id, {
                password: newPassword,
                reset_token: '',
                reset_token_expires: ''
            })

            return res.render("session/login", {
                user: req.body,
                success: "Senha atualizada com sucesso!"
            })
        } catch (err) {
            console.error(err)
            return res.render("session/password-reset", {
                user: req.body,
                token,
                error: "Erro inesperado, tente novamente!"
            })
        }
    }
}