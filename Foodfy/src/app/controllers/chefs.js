const data = require('../../../data.json')
const Chefs = require('../models/chefs')

exports.index = function(req, res) {
    const url = req.path
    
    Chefs.all(function(chefs) {
        if (url == '/admin/chefs') {
            return res.render('admin/chefs/index', {chefs})
        } else {
            return res.render('users/chefs', {chefs})
        }
    })
}

exports.create = function(req, res) {
    return res.render('admin/chefs/create')
}

exports.post = function(req, res) {
    const keys = Object.keys(req.body)
    
    for (const key of keys) {
        if (req.body[key] == "") {
            return res.send("Please, fill in all fields")
        }
    }

    Chefs.create(req.body, function(chef) {
        return res.redirect(`/admin/chefs/${chef.id}`)
    })
}

exports.show = function(req, res) {
    const { id } = req.params
    
    const params = {
        id,
        callback(chef) {
            if(!chef) return res.send("Chef not found!")

            return res.render('admin/chefs/chef', {chef, recipes: data.recipes})
        }
    }

    Chefs.find(params)
}

exports.edit = function(req, res) {
    const { id } = req.params
    const params = {
        id,
        callback(chef) {
            if (!chef) return res.send("Chef not found!")
    
            return res.render(`admin/chefs/edit`, { chef })
        }
    }

    Chefs.find(params)
}

exports.put = function(req, res) {
    const keys = Object.keys(req.body)
    
    for (const key of keys) {
        if (req.body[key] == "") {
            return res.send("Please, fill in all fields")
        }
    }
    
    Chefs.update(req.body, function() {
        return res.redirect(`/admin/chefs/${req.body.id}`)
    })
}

exports.delete = function(req, res) {
    Chefs.delete(req.body.id, function() {
        return res.redirect('/admin/chefs')
    })
}