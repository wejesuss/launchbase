const { hash } = require('bcryptjs')
const { unlinkSync } = require('fs')

const User = require('../models/User')
const Product = require('../models/Product')

const LoadProductsService = require('../services/loadProductService')
const { formatCpfCnpj, formatCep } = require('../../lib/utils')

module.exports = {
    registerForm(req, res) {
        try {
            return res.render("user/register")
        } catch (err) {
            console.error(err)
        }
    },
    async show(req, res) {
        const { user } = req
        try {
            user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)
            user.cep = formatCep(user.cep)
    
            return res.render("user/index", { user })   
        } catch (err) {
            console.error(err)
        }
    },
    async post(req, res) {
        try {
            let { name, email, cpf_cnpj, cep, address, password } = req.body
            
            cpf_cnpj = cpf_cnpj.replace(/\D/g, "")
            cep = cep.replace(/\D/g, "")
            password = await hash(password, 8)
            const userId = await User.create({
                name,
                email,
                cpf_cnpj,
                cep,
                address,
                password,
            })
            
            req.session.userId = userId
    
            return res.redirect("/users")   
        } catch (err) {
            console.error(err)
        }
    },
    async update(req, res) {
        try {
            const { user } = req
            let { name, email, cpf_cnpj, cep, address } = req.body            
            
            cpf_cnpj = cpf_cnpj.replace(/\D/g, "")
            cep = cep.replace(/\D/g, "")
            await User.update(user.id, {
                name,
                email,
                cpf_cnpj,
                cep,
                address
            })
            
            return res.render("user/index", {
                user: req.body,
                success: "Usuário atualizado com sucesso!"
            })

        } catch (err) {
            console.error(err)
            return res.render("user/index", {
                error: "Algum erro aconteceu!"
            })
        }
    },
    async delete(req, res) {
        try {
            let products = await Product.findAll({ where: {user_id: req.body.id} })

            const allFilesPromise = products.map(product => 
                Product.files(product.id))

            let promiseResults = await Promise.all(allFilesPromise)
            
            await User.delete(req.body.id)
            req.session.destroy()

            promiseResults.map(files => {
                files.map(file => {
                    try {
                        unlinkSync(file.path)
                    } catch (err) {
                        console.error(err)
                    }
                })
            })

            return res.render("session/login", {
                session: "",
                success: "Conta deletada com sucesso!"
            })

        } catch (err) {
            console.error(err)
            return res.render("user/index", {
                user: req.body,
                error: "Erro ao deletar sua conta!"
            })
        }
    },
    async ads(req, res) {
        const products = await LoadProductsService.load('products', {
            where: { user_id: req.session.userId }
        })

        return res.render("user/ads", { products })
    }
}