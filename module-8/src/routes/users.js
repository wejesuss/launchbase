const express = require('express')
const routes = express.Router()

const SessionController = require('../app/controllers/SessionController')
const UserController = require('../app/controllers/UserController')

const UserValidator = require('../app/validators/user')
const SessionValidator = require('../app/validators/session')
const { preventRepeatedLogin, registeredUsersOnly } = require('../app/middlewares/session')

// login/logout
routes.get('/login', preventRepeatedLogin, SessionController.loginForm)
routes.post('/login', SessionValidator.login, SessionController.login)
routes.post('/logout', SessionController.logout)

// reset password /forgot
routes.get('/forgot-password', SessionController.forgotForm)
routes.get('/password-reset', SessionController.resetForm)
routes.post('/forgot-password', UserValidator.forgot, SessionController.forgot)
routes.post('/password-reset', UserValidator.reset, SessionController.reset)

// user register UserController
routes.get('/register', UserController.registerForm)
routes.post('/register', UserValidator.post, UserController.post)

routes.get('/', registeredUsersOnly, UserValidator.show, UserController.show)
routes.put('/', UserValidator.update, UserController.update)
routes.delete('/', UserController.delete)

routes.get('/ads', registeredUsersOnly, UserController.ads)

module.exports = routes