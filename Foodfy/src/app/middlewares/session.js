const User = require('../models/users')
const Recipes = require('../models/recipes')


function registeredUsersOnly(req, res, next) {
    if (!req.session.userId) 
        return res.redirect("/users/login")
    
    next()
}

async function adminOnly(req, res, next) {
    if (!req.session.userId) 
        return res.redirect("/")

    let id = req.session.userId

    const currentUser = await User.find({ where: {id} })

    if(currentUser.is_admin == false)
        return res.redirect("/admin/")
    
    next()
}

async function ownersAndAdminOnly(req, res, next) {
    if (!req.session.userId) return res.redirect("/")
    
    let id = req.body.id
    if(!id) id = req.params.id

    const recipe = await Recipes.find({ where: {id} })
    const currentUser = await User.find({ where: {id: req.session.userId} })

    if(currentUser.is_admin == false && currentUser.id != recipe.user_id)
        return res.redirect("/admin/recipes/")
    
    next()
}

function preventRepeatedLogin(req, res, next) {
    if (req.session.userId) 
        return res.redirect("/admin/")
    
    next()
}

module.exports = {
    registeredUsersOnly,
    preventRepeatedLogin,
    adminOnly,
    ownersAndAdminOnly
}