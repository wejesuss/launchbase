function registeredUsersOnly(req, res, next) {
    if (!req.session.userId) 
        return res.redirect("/admin/users/login")
    
    next()
}

function preventRepeatedLogin(req, res, next) {
    if (req.session.userId) 
        return res.redirect("/admin/users")
    
    next()
}

module.exports = {
    registeredUsersOnly,
    preventRepeatedLogin
}