const LoadProductService = require('../services/loadProductService')
const LoadOrderService = require('../services/loadOrderService')

const User = require('../models/User')
const Order = require('../models/Order')

const mailer = require('../../lib/mailer')
const Cart = require('../../lib/cart')
const { formatCep } = require('../../lib/utils')

const email = (seller, product, buyer) => `
<h2 style="font-family: 'Roboto', sans-serif">Olá ${seller.name}</h2>
<p style="color: #999">Você tem um novo pedido de compra</p>
<p style="color: #777">Produto: ${product.name}</p>
<p style="color: #777; font-weight: bold;">Preço: ${product.formattedPrice}</p>
${product.formattedPrice != product.formattedTotalPrice ? 
    `<p style="color: #777; font-weight: bold;">Total: ${product.formattedTotalPrice}</p>` : ''}
<br/><br/>
<h3 style="font-family: 'Roboto', sans-serif">Dados do comprador</h3>
<p style="color: #333">${buyer.name}</p>
<p style="color: #333">${buyer.email}</p>
<p style="color: #333">${buyer.address}</p>
<p style="color: #333">${formatCep(buyer.cep)}</p>
<br/><br/>
<p style="font-family: 'Roboto', sans-serif"><strong>Entre em contato com o comprador para finalizar a venda!</strong></p>
<br/><br/>
<p style="font-family: 'Roboto', sans-serif">Atenciosamente, Equipe Launchstore!</p>
`

module.exports = {
    async index(req, res) {
        try {
            const orders = await LoadOrderService.load('orders', { where: { buyer_id: req.session.userId } })
    
            return res.render("orders/index", { orders })
        } catch (err) {
            console.error(err)
            return res.render("orders/error", { error: "Erro inesperado, tente novamente." })   
        }
    },  
    async sales(req, res) {
        try {
            const sales = await LoadOrderService.load('orders', { where: { seller_id: req.session.userId } })
        
            return res.render("orders/sales", { sales })
        } catch (err) {
            console.error(err)
            return res.render("orders/error", { error: "Erro inesperado, tente novamente." })   
        }
    },
    async show(req, res) {
        try {
            const order = await LoadOrderService.load('order', { 
                where: { id: req.params.id } 
            })
    
            return res.render("orders/details", { order })   
        } catch (err) {
            console.error(err)
        }
    },
    async post(req, res) {
        try {
            const cart = Cart.init(req.session.cart)
            const buyer_id = req.session.userId
            const filteredItems = cart.items.filter(item => item.product.user_id != buyer_id)
            
            const createOrderPromise = filteredItems.map(async item => {
                let { product, price: total, quantity, formattedPrice } = item
                const { user_id: seller_id, id: product_id, price } = product
                const status = "open"

                const orderId = await Order.create({
                    seller_id,
                    buyer_id,
                    product_id,
                    price,
                    quantity,
                    total,
                    status
                })

                product = await LoadProductService.load('product', { where: {id: product_id} })
                const seller = await User.findOne({ where: {id: seller_id} })
                const buyer = await User.findOne({ where: {id: buyer_id} })
                product.formattedTotalPrice = formattedPrice.replace("R$", "R$ ")

                if(seller.id != buyer.id) {    
                    mailer.sendMail({
                        from: 'no-reply@launchstore.com',
                        to: `${seller.email}`,
                        subject: 'Novo pedido de compra!',
                        html: email(seller, product, buyer)
                    })
                }

                return orderId
            })

            await Promise.all(createOrderPromise)
            
            delete req.session.cart
            Cart.init()

            return res.render('orders/success')
        } catch (error) {
            console.error(error)
            return res.render('orders/error', { error: "Erro inesperado, tente novamente." })
        }
    },
    async update(req, res) {
        try {
            const { id, action } = req.params
            const acceptedActions = ['close', 'cancel']

            if(!acceptedActions.includes(action)) return res.send("Can't do this action.")

            const order = await Order.findOne({ where: {id} })
            if(!order) return res.send("Order not found!")

            if((order.status != 'open') || (order.seller_id != req.session.userId)) return res.send("Can't do this action.")

            const statuses = {
                close: "sold",
                cancel: "canceled"
            }

            const status = statuses[action]

            await Order.update(id, {
                status
            })

            return res.redirect("/orders/sales")
        } catch (err) {
            console.error(err)
        }
    }
}