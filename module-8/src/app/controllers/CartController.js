const Cart = require('../../lib/cart')
const LoadProductService = require('../services/loadProductService')

module.exports = {
    async index(req, res) {
        try {
            let { cart } = req.session        
            cart = Cart.init(cart)
    
            return res.render("cart/index", { cart })
        } catch (err) {
            console.error(err)
        }
    },
    async addOne(req, res) {
        try {
            const { productId: id } = req.params
            const product = await LoadProductService.load('product', { where: {id} })
            if(product.status != 1 || product.user_id === req.session.userId) return res.redirect("/")
            
            let { cart } = req.session
    
            cart = Cart.init(cart).addOne(product)
            req.session.cart = cart
    
            return res.redirect("/cart")
        } catch (err) {
            console.error(err)
        }
    },
    async removeOne(req, res) {
        try {
            const { productId: id } = req.params
            let { cart } = req.session
            if(!cart || !cart.items[0]) return res.render("cart/index", { error: "Carrinho vazio", cart })
            
            cart = Cart.init(cart).removeOne(id)
            req.session.cart = cart

            return res.redirect("/cart")
        } catch (err) {
            console.error(err)
        }
    },
    async delete(req, res) {
        try {
            const { productId: id } = req.params
            let { cart } = req.session
            if(!cart || !cart.items[0]) return res.render("cart/index", { error: "Carrinho vazio", cart })
            
            cart = Cart.init(cart).delete(id)
            req.session.cart = cart
    
            return res.redirect("/cart")
        } catch (err) {
            console.error(err)
        }
    },
    async deleteAll(req, res) {
        try {
            let { cart } = req.session
            if(!cart || !cart.items[0]) return res.render("cart/index", { error: "Carrinho vazio", cart })
            
            cart = Cart.init(cart).removeAll()
            req.session.cart = cart
    
            return res.redirect("/cart")
        } catch (err) {
            console.error(err)
        }
    }
}