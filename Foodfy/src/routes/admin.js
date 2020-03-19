const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const recipes = require("../app/controllers/recipes")
const chefs = require("../app/controllers/chefs")
const users = require("../app/controllers/users")

const recipeValidator = require("../app/validators/recipes")
const chefValidator = require("../app/validators/chefs")
const { registeredUsersOnly, ownersAndAdminOnly, adminOnly } = require("../app/middlewares/session")

routes.get('/recipes/dashboard', recipeValidator.index, recipes.index)

routes.get('/recipes', recipeValidator.index, recipes.index)
routes.get('/recipes/create', registeredUsersOnly, recipes.create)
routes.get('/recipes/:id', recipes.show)
routes.get('/recipes/:id/edit', ownersAndAdminOnly, recipes.edit)

routes.post('/recipes', registeredUsersOnly, multer.array('photos', 5), recipeValidator.post, recipes.post)
routes.put('/recipes', multer.array('photos', 5), ownersAndAdminOnly, recipeValidator.put, recipes.put)
routes.delete('/recipes', ownersAndAdminOnly, recipes.delete)


routes.get('/chefs', chefs.index)
routes.get('/chefs/create', adminOnly, chefs.create)
routes.get('/chefs/:id', chefs.show)
routes.get('/chefs/:id/edit', adminOnly, chefs.edit)

routes.post('/chefs', adminOnly, multer.single('photos'), chefValidator.post, chefs.post)
routes.put('/chefs', adminOnly, multer.single('photos'), chefValidator.put, chefs.put)
routes.delete('/chefs', adminOnly, chefs.delete)

// routes.get('/profile', ProfileController.index) // Mostrar o formulário com dados do usuário logado
// routes.put('/profile', ProfileController.put)// Editar o usuário logado

// Rotas que o administrador irá acessar para gerenciar usuários
routes.get('/users',  users.index) //Mostrar a lista de usuários cadastrados

routes.get('/users/register',  users.registerForm) //formulario de criação
routes.get('/users/edit/:id',  users.show) //formulario de edição

routes.post('/users',  users.post) //Cadastrar um usuário
routes.put('/users',  users.put) // Editar um usuário
routes.delete('/users',  users.delete) // Deletar um usuário

module.exports = routes