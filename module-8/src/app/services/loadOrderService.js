const LoadProductService = require('./LoadProductService')
const User = require('../models/User')
const Order = require('../models/Order')

const { formatPrice, date } = require('../../lib/utils')

async function format(order) {
    try {
        order.buyer = await User.findOne({ where: {id: order.buyer_id} })
        order.seller = await User.findOne({ where: {id: order.seller_id} })
        order.product = await LoadProductService.load('productAlsoDeleted', { where: {id: order.product_id} })

        order.formattedPrice = formatPrice(order.price).replace("R$", "R$ ")
        order.formattedTotal = formatPrice(order.total).replace("R$", "R$ ")
        
        const statuses = {
            open: 'Aberto',
            sold: 'Vendido',
            canceled: 'Cancelada'
        }

        order.formattedStatus = statuses[order.status] || 'Irreconhecido'
        const updatedAt = date(order.updated_at) 
        order.formattedUpdatedAt = `${order.formattedStatus} em ${updatedAt.format} às ${updatedAt.hour}:${updatedAt.minutes}`

        return order
    } catch (err) {
        console.error(err)
    }
}

const LoadService = {
    load(service, filter) {
        this.filter = filter

        return this[service]()
    },
    async order() {
        try {
            const order = await Order.findOne(this.filter)

            return format(order)
        } catch (error) {
            console.error(error)
        }
    },
    async orders() {
        try {
            const orders = await Order.findAll(this.filter)
            const ordersPromise = orders.map(format)

            return Promise.all(ordersPromise)
        } catch (err) {
            console.error(err)
        }
    },
    format
}

module.exports = LoadService