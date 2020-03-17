function registeredUsersOnly(req, res, next) {
    if (!req.session.userId) 
        return res.redirect("/users/login")
    
    next()
}

function preventRepeatedLogin(req, res, next) {
    if (req.session.userId) 
        return res.redirect("/users")
    
    next()
}

module.exports = {
    registeredUsersOnly,
    preventRepeatedLogin
}