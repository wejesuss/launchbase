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
    if(!req.session.userId) return res.render("session/login", {
        error: "Você não pode acessar!"
    })
        
    const userIsAdmin = await verifyUserIsAdmin(req.session.userId)
    if(!userIsAdmin) return res.redirect("/admin/")

    let { page, limit } = req.query
    page = page || 1
    limit = limit || 6
    try {
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

        return res.render('admin/isAdmin/listUsers', { users, pagination })
    } catch (err) {
        console.log(err)
        return res.redirect("/admin/")
    }
}

exports.registerForm = async function(req, res) {
    try {
        if(!req.session.userId) return res.redirect("/users/login/")
        
        const userIsAdmin = await verifyUserIsAdmin(req.session.userId)
        if(!userIsAdmin) return res.redirect("/admin/")

        return res.render('admin/isAdmin/register')   
    } catch (err) {
        console.error(err)
        return res.redirect("/admin/")
    }
}

exports.post = async function(req, res) {
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/isAdmin/register", { checkedFields })

        const { email } = req.body
        const user = await User.find({ where: {email} })

        if (user) {
            return res.render("admin/isAdmin/register", {
                user: req.body,
                error: "Email já cadastrado!"
            })
        }

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
                    <strong>${password}</strong>
                </p>
            `,
        })

        return res.render(`admin/isAdmin/user`, {
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
    const { id } = req.params
    try {
        if(!req.session.userId) return res.redirect("/users/login/")
        const userIsAdmin = await verifyUserIsAdmin(req.session.userId)
        if(!userIsAdmin) return res.redirect("/admin/")
    
        const user = await User.find({ where: {id} })
    
        const {users, pagination} = await renderPaginate(1, 6)
        if (!user) return res.render("admin/isAdmin/listUsers", {
            users,
            pagination,
            error: "Usuário não encontrado!"
        })

        if(userIsAdmin.isPrincipal == false && (user.is_admin == true && user.id != req.session.userId)) {
            return res.render("admin/isAdmin/listUsers", { 
                users,
                pagination,
                error: "Nao pode alterar este usuário!"
            })
        }

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
    try {
        if(!req.session.userId) return res.redirect("/admin/users/register/")
        const userIsAdmin = await verifyUserIsAdmin(req.session.userId)
        if(!userIsAdmin) return res.redirect("/admin/")

        if(userIsAdmin.isPrincipal == false && req.body.id == 1) return res.redirect("/admin/users")

        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/isAdmin/user", { checkedFields })
    
        const user = await User.find({ where: {id: req.body.id} })
        
        let isAdmin = false
        if(!req.body.is_admin && userIsAdmin.isPrincipal == true) isAdmin = false
        if(!req.body.is_admin && user.id == req.session.userId) isAdmin = true
        if(user.is_admin == true && userIsAdmin.isPrincipal == false) isAdmin = true
        if(req.body.is_admin) isAdmin = true
        
        req.body.is_admin = isAdmin

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
            error: "Algum erro aconteceu!"
        })
    }
}

exports.delete = async function(req, res) {
    try {
        if(!req.session.userId) return res.redirect("/admin/users/register/")
        const userIsAdmin = await verifyUserIsAdmin(req.session.userId)
        if(!userIsAdmin) return res.redirect("/admin/users/")

        let {users, pagination} = await renderPaginate(1, 6)

        const userToBeDelete = await verifyUserIsAdmin(req.body.id)

        console.log((userToBeDelete && userToBeDelete.isAdmin == true && userIsAdmin.isPrincipal == false), userToBeDelete)
        console.log(req.session.userId == req.body.id, req.body.id, req.session.userId)

        if((userToBeDelete && userToBeDelete.isAdmin == true && 
            userIsAdmin.isPrincipal == false) || 
            req.session.userId == req.body.id) {
                return res.render("admin/isAdmin/listUsers", {
                    users,
                    pagination,
                    error: "Esta conta não pode ser deletada!"
                })
        }
        
        const index = users.findIndex(user => {
            return user.id == req.body.id
        })
        users.splice(index, 1)

        await User.delete(req.body.id)
        return res.render("admin/isAdmin/listUsers", {
            users,
            pagination,
            success: "Conta deletada com sucesso!"
        })

    } catch (err) {
        console.error(err)
        return res.render("admin/isAdmin/user", {
            user: req.body,
            error: "Erro ao deletar essa conta!"
        })
    }
}