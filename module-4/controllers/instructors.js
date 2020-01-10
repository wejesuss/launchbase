Intl = require("intl")
const fs = require('fs')
const data = require("../data.json")
const { age, date, servicesToArray, servicesToString } = require("../utils")


exports.index = function (req, res) {
    
    return res.render("instructors/index", { instructors : data.instructors })
}

exports.create = function (req, res) {
    return res.render("instructors/create")
}

exports.post = function (req, res) {
    const keys = Object.keys(req.body)

    for (const key of keys) {
        if (req.body[key] == "") {
            res.send("Please, fill in all fields")
        }
    }

    let { avatar_url, name, birth, gender, services } = req.body

    let id = 1
    let lastInstructor = data.instructors[data.instructors.length - 1]
    
    if (lastInstructor) {
        id = lastInstructor.id + 1
    }
    
    birth = Date.parse(birth)
    const created_at = Date.now()
    services = servicesToArray(services)

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
        created_at: new Intl.DateTimeFormat('pt-BR').format(instructorFound.created_at)
    }

    return res.render("instructors/show", { instructor })
}

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
        birth : date(instructorFound.birth).iso,
        services : servicesToString(instructorFound.services)
    }

    res.render("instructors/edit", { instructor })

}

exports.put = function (req, res) {
    const { id, services } = req.body
    let index = 0

    const instructorFound = data.instructors.find(function (instructor, indexFound) {
        if (id == instructor.id) {
            index = indexFound
            return true
        }
    })

    if (!instructorFound) {
        res.send("Instructor not found!")
    }

    const instructor = {
        ...instructorFound,
        ...req.body,
        services: servicesToArray(services),
        birth : Date.parse(req.body.birth),
        id : Number (req.body.id)
    }

    data.instructors[index] = instructor

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
        if (err) {
            return res.send("Write error!")
        }
        
        res.redirect(`/instructors/${id}`)
    })

}

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

    if (data.index != instructorFound.id) {
        data.instructors = instructorsFiltered
    } else {
        data.index -= 1
        data.instructors = instructorsFiltered
    }

    fs.writeFile("data.json", JSON.stringify(data, null, 2), function (err) {
        if (err) return res.send("Delete error!")

        res.redirect("/instructors/")
    })
}