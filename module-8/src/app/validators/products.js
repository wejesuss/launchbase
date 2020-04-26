function verifyFields(body) {
    try {
        const keys = Object.keys(body)

        for (const key of keys) {
            if (body[key] == "" && key != "removed_files") 
                return { error: "Por favor, preencha todos os campos!" }
        }

    } catch (err) {
        console.error(err)
    }
}

async function post(req, res, next) {
    try {
        const checkFields = verifyFields(req.body)
        if (checkFields) {
            return res.send(checkFields.error)
        }

        if (!req.files || req.files.length == 0) 
            return res.send("Por favor, envie ao menos uma imagem!")

        next()
    } catch(err) {
        console.error(err)
    }
}

async function put(req, res, next) {
    try {
        const checkFields = verifyFields(req.body)
        if (checkFields) {
            return res.send(checkFields.error)
        }

        next()
    } catch(err) {
        console.error(err)
    }
}

module.exports = {
    post,
    put
}