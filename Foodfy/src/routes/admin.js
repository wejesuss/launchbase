const express = require('express')
const routes = express.Router()

const multer = require('../app/middlewares/multer')

const recipes = require("../app/controllers/recipes")
const chefs = require("../app/controllers/chefs")
const users = require("../app/controllers/users")
const session = require("../app/controllers/session")

const { preventRepeatedLogin, registeredUsersOnly } = require("../app/middlewares/session")
const { validateLogin } = require("../app/validators/session")

routes.get('/recipes', recipes.index)
routes.get('/recipes/create', registeredUsersOnly, recipes.create)
routes.get('/recipes/:id', recipes.show)
routes.get('/recipes/:id/edit', registeredUsersOnly, recipes.edit)

routes.post('/recipes', registeredUsersOnly, multer.array('photos', 5), recipes.post)
routes.put('/recipes', registeredUsersOnly, multer.array('photos', 5), recipes.put)
routes.delete('/recipes', registeredUsersOnly, recipes.delete)

routes.get('/chefs', chefs.index)
routes.get('/chefs/create', registeredUsersOnly, chefs.create)
routes.get('/chefs/:id', chefs.show)
routes.get('/chefs/:id/edit', registeredUsersOnly, chefs.edit)

routes.post('/chefs', registeredUsersOnly, multer.single('photos'), chefs.post)
routes.put('/chefs', registeredUsersOnly, multer.single('photos'), chefs.put)
routes.delete('/chefs', registeredUsersOnly, chefs.delete)


routes.get('/users/login', preventRepeatedLogin, session.loginForm)
routes.post('/users/login', validateLogin, session.login)
routes.post('/users/logout', session.logout)

// reset password /forgot
// routes.get('/forgot-password', session.forgotForm)
// routes.get('/password-reset', session.resetForm)
// routes.post('/forgot-password', UserValidator.forgot, session.forgot)
// routes.post('/password-reset', UserValidator.reset, session.reset)


// routes.get('/profile', ProfileController.index) // Mostrar o formulário com dados do usuário logado
// routes.put('/profile', ProfileController.put)// Editar o usuário logado

// Rotas que o administrador irá acessar para gerenciar usuários
routes.get('/users', registeredUsersOnly, users.index) //Mostrar a lista de usuários cadastrados

routes.get('/users/register', registeredUsersOnly, users.registerForm) //formulario de criação
routes.get('/users/edit/:id', registeredUsersOnly, users.show) //formulario de edição

routes.post('/users', registeredUsersOnly, users.post) //Cadastrar um usuário
routes.put('/users', registeredUsersOnly, users.put) // Editar um usuário
routes.delete('/users', registeredUsersOnly, users.delete) // Deletar um usuário

module.exports = routes