const LoadProductService = require('../services/loadProductService')

function registeredUsersOnly(req, res, next) {
    if (!req.session.userId) 
        return res.redirect("/users/login")
    
    next()
}

async function ownersOnly(req, res, next) {
    if (!req.session.userId) 
        return res.redirect("/users/login")
    
    
    const product = await LoadProductService.load('product', { where: {id: req.params.id} })
    if(req.session.userId != product.user_id)
        return res.redirect(`/products/${req.params.id}`)
    
    req.product = product

    next()
}

function preventRepeatedLogin(req, res, next) {
    if (req.session.userId) 
        return res.redirect("/users")
    
    next()
}

module.exports = {
    registeredUsersOnly,
    preventRepeatedLogin,
    ownersOnly
}