Intl = require("intl")
const fs = require('fs')
const data = require("../data.json")
const { date, blood } = require("../utils")


exports.index = function (req, res) {
    return res.render("members/index", { members : data.members })
}

exports.create = function (req, res) {
    return res.render("members/create")
}

exports.post = function (req, res) {
    const keys = Object.keys(req.body)

    for (const key of keys) {
        if (req.body[key] == "") {
            res.send("Please, fill in all fields")
        }
    }

    let id = 1
    let lastMember = data.members[data.members.length - 1]
    
    if (lastMember) {
        id = lastMember.id + 1
    }
   
    data.members.push({
        id,
        ...req.body,
        birth : Date.parse(req.body.birth),
        weight : Number(req.body.weight),
        height : Number(req.body.height)
    })

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
        if (err) return res.send("Write file error!")

        res.redirect("/members")
    })
}

exports.show = function (req, res) {
    const { id } = req.params

    const memberFound = data.members.find(function (member) {
        return id == member.id
    })

    if (!memberFound) {
        res.send("member not found!")
    }

    const member = {
        ...memberFound,
        birth: date(memberFound.birth).birthDay,
        blood: blood(memberFound.blood)
    }

    return res.render("members/show", { member })
}

exports.edit = function (req, res) {
    const { id } = req.params

    const memberFound = data.members.find(function (member) {
        return id == member.id
    })

    if (!memberFound) {
        res.send("member not found!")
    }

    const member = {
        ...memberFound,
        birth: date(memberFound.birth).iso
    }

    res.render("members/edit", { member })

}

exports.put = function (req, res) {
    const { id } = req.body
    let index = 0

    const memberFound = data.members.find(function (member, indexFound) {
        if (id == member.id) {
            index = indexFound
            return true
        }
    })

    if (!memberFound) {
        res.send("member not found!")
    }

    const member = {
        ...memberFound,
        ...req.body,
        weight: Number(req.body.weight),
        height: Number(req.body.height),
        birth : Date.parse(req.body.birth),
        id : Number(req.body.id)
    }

    data.members[index] = member

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
        if (err) {
            return res.send("Write error!")
        }
        
        res.redirect(`/members/${id}`)
    })

}

exports.delete = function (req, res) {
    const { id } = req.body

    const memberFound = data.members.find(function (member) {
        return id == member.id
    })

    if (!memberFound) {
        res.send("member not found!")
    }
    
    const membersFiltered = data.members.filter(function (member) {
        return id != member.id
    })

    if (data.index != memberFound.id) {
        data.members = membersFiltered
    } else {
        data.index -= 1
        data.members = membersFiltered
    }

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
        if (err) return res.send("Delete error!")

        res.redirect("/members/")
    })
}