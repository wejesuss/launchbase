Intl = require("intl")
const fs = require('fs')
const data = require("./data.json")
const { age, date } = require("./utils")

// show

exports.show = function (req, res) {
    const { id } = req.params

    const instructorFound = data.instructors.find(function (instructor) {
        return id == instructor.id
    })

    if (!instructorFound) {
        res.send("Instructor not found!")
    }

    const instructor = {
        ...instructorFound,
        age: age(instructorFound.birth),
        services: instructorFound.services.split(','),
        created_at: new Intl.DateTimeFormat('pt-BR').format(instructorFound.created_at)
    }

    return res.render("instructors/show", { instructor })
}

// create

exports.create = function (req, res) {
    const keys = Object.keys(req.body)

    for (const key of keys) {
        if (req.body[key] == "") {
            res.send("Please, fill in all fields")
        }
    }

    let { avatar_url, name, birth, gender, services } = req.body

    birth = Date.parse(birth)
    const id = Number(data.instructors.length + 1)
    const created_at = Date.now()

    data.instructors.push({
        id,
        avatar_url,
        name,
        birth,
        gender,
        services,
        created_at
    })

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
        if (err) return res.send("Write file error!")

        res.redirect("/instructors")
    })
}

// edit form

exports.edit = function (req, res) {
    const { id } = req.params

    const instructorFound = data.instructors.find(function (instructor) {
        return id == instructor.id
    })

    if (!instructorFound) {
        res.send("Instructor not found!")
    }

    const instructor = {
        ...instructorFound,
        birth : date(instructorFound.birth)
    }

    res.render("instructors/edit", { instructor })

}

// put / edit

exports.put = function (req, res) {
    const { id } = req.body

    const instructorFound = data.instructors.find(function (instructor) {
        return id == instructor.id
    })

    if (!instructorFound) {
        res.send("Instructor not found!")
    }

    const instructor = {
        ...instructorFound,
        ...req.body,
        birth : Date.parse(req.body.birth),
        
    }

    data.instructors[id - 1] = instructor
    data.instructors[id - 1].id = Number(data.instructors[id - 1].id)

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
        if (err) {
            return res.send("Write error!")
        }
        
        res.redirect(`/instructors/${id}`)
    })

}

// delete

exports.delete = function (req, res) {
    const { id } = req.body

    const instructorFound = data.instructors.find(function (instructor) {
        return id == instructor.id
    })

    if (!instructorFound) {
        res.send("Instructor not found!")
    }
    
    const instructorsFiltered = data.instructors.filter(function (instructor) {
        return id != instructor.id
    })

    data.instructors = instructorsFiltered

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
        if (err) return res.send("Delete error!")

        res.redirect("/instructors/")
    })
}