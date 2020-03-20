const User = require('../models/users')
const { randomBytes } = require('crypto')
const { hash } = require('bcryptjs')
const mailer = require('../../lib/mailer')

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

async function renderPaginate(page, limit) {    
   
    let offset = limit * (page - 1)
    const params = {limit, offset}

    const users = await User.paginate(params)

    let pagination
    if(users[0]) {
        pagination = {
            total: Math.ceil(users[0].total / limit),
            page,
            limit
        }
    }

    return { 
        users, 
        pagination 
    }
}

async function verifyUserIsAdmin(userId) {
    const user = await User.find({ where: {id: userId} })
    
    if(user && user.is_admin == true) return {
        isAdmin: true,
        isPrincipal: (user.id == 1) ? true : false
    }
}

exports.index = async function(req, res) {
    const { users, pagination } = req.listUsers
    try {
        return res.render("admin/isAdmin/listUsers", { users, pagination })
    } catch (err) {
        console.error(err)
        return res.render("admin/isAdmin/listUsers", {
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.registerForm = async function(req, res) {
    try {
        return res.render('admin/isAdmin/register')   
    } catch (err) {
        console.error(err)
        return res.redirect("/admin/users")
    }
}

exports.post = async function(req, res) {
    try {
        if(!req.body.is_admin) {
            req.body.is_admin = false
        } else {
            req.body.is_admin = true
        }

        const password = randomBytes(8).toString("hex")
        req.body.password = await hash(password, 8)

        await User.create(req.body)

        await mailer.sendMail({
            from: 'no-reply@foodfy.com',
            to: req.body.email,
            subject: 'Senha usuario Foodfy',
            html: `
                <h5>Sua senha chegou :)</h5>
                <p>Aqui está sua senha do seu usuário foodfy, você pode alterá-la a qualquer momento!</p>
                <p>
                    Tome conta dela ${req.body.name}
                    <br>
                    Email:
                    ${req.body.email}
                    <br>
                    Senha:
                    <strong>${password}</strong>
                </p>
            `,
        })

        return res.render("admin/isAdmin/user", {
            user: req.body,
            success: "Usuário cadastrado com sucesso."
        }) 
   
    } catch (err) {
        console.error(err)
        return res.render("admin/isAdmin/register", {
            error: "Erro inesperado, tente novamente!"
        })
    }    
}

exports.show = async function(req, res) {
    const { user } = req
    try {
        return res.render("admin/isAdmin/user", { 
            user
        })
    } catch (err) {
        console.error(err)
        return res.render("admin/isAdmin/register", { 
            error: "Desculpe! Algum erro ocorreu!"
        })
    }
}

exports.put = async function(req, res) {
    const { user } = req
    try {
        let { id, name, email, is_admin } = req.body
        await User.update(id, {
            name,
            email,
            is_admin
        })

        const {users, pagination} = await renderPaginate(1, 6)
        return res.render("admin/isAdmin/listUsers", {
            users,
            pagination,
            success: "Usuário atualizado com sucesso!"
        })
    } catch (err) {
        console.error(err)
        return res.render("admin/isAdmin/user", {
            user,
            error: "Algum erro aconteceu!"
        })
    }
}

exports.delete = async function(req, res) {
    const { users, pagination } = req.listUsers
    try {
        const index = users.findIndex(user => {
            return user.id == req.body.id
        })
        users.splice(index, 1)

        User.delete(req.body.id)

        return res.render("admin/isAdmin/listUsers", {
            users,
            pagination,
            success: "Conta deletada com sucesso!"
        })
    } catch (err) {
        console.error(err)
        return res.render("admin/isAdmin/listUsers", {
            users,
            pagination,
            error: "Erro ao deletar essa conta!"
        })
    }
}