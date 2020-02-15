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

exports.show = function(req, res) {
    const { id } = req.params
    
    const params = {
        id,
        callback(chef) {
            return res.render('admin/chefs/chef', {chef, recipes: data.recipes})
        }
    }

    Chefs.find(params)
}

exports.create = function(req, res) {
    return res.render('admin/chefs/create')
}

exports.post = function(req, res) {
    const keys = Object.keys(req.body)
    
    for (const key of keys) {
        if (req.body[key] == "") {
            res.send("Please, fill in all fields")
        }
    }

    Chefs.create(req.body, function(chef) {
        return res.redirect(`/admin/chefs/${chef.id}`)
    })
}