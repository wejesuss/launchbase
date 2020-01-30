const Member = require('../models/member')
const { date } = require("../../lib/utils")

module.exports = {
    index(req, res) {
        Member.all(function (members) {
            return res.render("members/index", { members })
        })

    },

    create(req, res) {
        Member.instructorSelectOptions(function (options) {
            return res.render("members/create", { instructorOptions: options })
        })
    },

    post(req, res) {
        const keys = Object.keys(req.body)

        for (const key of keys) {
            if (req.body[key] == "") {
                res.send("Please, fill in all fields")
            }
        }

        Member.create(req.body, function (member) {
            return res.redirect(`/members/${member.id}`)
        })
    },

    show(req, res) {
        Member.find(req.params.id, function (member) {
            if (!member) return res.send("Member not found!")

            member.birth = date(member.birth).birthDay

            return res.render('members/show', { member })
        })
    },

    edit(req, res) {
        Member.find(req.params.id, function (member) {
            if (!member) return res.send("Member not found!")

            member.birth = date(member.birth).iso

            Member.instructorSelectOptions(function (options) {
                return res.render(`members/edit`, { member, instructorOptions: options })
            })
        })
    },

    put(req, res) {
        const keys = Object.keys(req.body)

        for (const key of keys) {
            if (req.body[key] == "") {
                res.send("Please, fill in all fields")
            }
        }

        Member.update(req.body, function () {
            return res.redirect(`/members/${req.body.id}`)
        })
    },

    delete(req, res) {
        Member.delete(req.body.id, function () {
            return res.redirect(`/members`)
        })
    },
}