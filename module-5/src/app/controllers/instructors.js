const Instructor = require('../models/instructor')
const { age, date } = require("../../lib/utils")

module.exports = {
    index(req, res) {
        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 2

        let offset = limit * (page - 1)

        const params = {
            filter,
            limit,
            offset,
            callback(instructors) {
                for (const instructor in instructors) {
                    instructors[instructor].services = instructors[instructor].services.split(',')
                }

                let pagination
                if(instructors[0]) {
                     pagination = {
                        total: Math.ceil(instructors[0].total / limit),
                        page
                    }
                }
                
                return res.render("instructors/index", { instructors, filter, pagination })
            }
        }

        Instructor.paginate(params)
    },

    create(req, res) {
        return res.render("instructors/create")
    },

    post(req, res) {
        const keys = Object.keys(req.body)

        for (const key of keys) {
            if (req.body[key] == "") {
                res.send("Please, fill in all fields")
            }
        }

        Instructor.create(req.body, function (instructor) {
            return res.redirect(`/instructors/${instructor.id}`)
        })
    },

    show(req, res) {
        Instructor.find(req.params.id, function (instructor) {
            if (!instructor) return res.send("Instructor not found!")

            instructor.age = age(instructor.birth)
            instructor.created_at = date(instructor.created_at).format
            instructor.services = instructor.services.split(',')

            return res.render('instructors/show', { instructor })
        })
    },

    edit(req, res) {
        Instructor.find(req.params.id, function (instructor) {
            if (!instructor) return res.send("Instructor not found!")

            instructor.birth = date(instructor.birth).iso

            return res.render(`instructors/edit`, { instructor })
        })
    },

    put(req, res) {
        const keys = Object.keys(req.body)

        for (const key of keys) {
            if (req.body[key] == "") {
                res.send("Please, fill in all fields")
            }
        }

        Instructor.update(req.body, function () {
            return res.redirect(`/instructors/${req.body.id}`)
        })
    },

    delete(req, res) {
        Instructor.delete(req.body.id, function () {
            return res.redirect(`/instructors`)
        })
    },
}