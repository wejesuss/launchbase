const Product = require('../models/Product')

const { formatPrice, date } = require('../../lib/utils')

async function getImages(productId) {
    let files = await Product.files(productId)
    files = files.map(file => ({
        ...file,
        src: `${file.path.replace("public", "").replace(/\\/g, "/" )}`
    }))

    return files
}

async function format(product) {
    try {
        const files = await getImages(product.id)
        product.img = files[0].src
        product.files = files
        product.formattedPreviousPrice = formatPrice(product.previous_price).replace("R$", "R$ ")
        product.formattedPrice = formatPrice(product.price).replace("R$", "R$ ")

        const { day, minutes,  hour, month } = date(product.updated_at)

        product.published = {
            day: `${day}/${month}`,
            hour: `${hour}h${minutes}`,
        }

        return product
    } catch (err) {
        console.error(err)
    }
}

const LoadService = {
    load(service, filter) {
        this.filter = filter

        return this[service]()
    },
    async product() {
        try {
            const product = await Product.findOne(this.filter)
            return format(product)
        } catch (error) {
            console.error(error)
        }
    },
    async productAlsoDeleted() {
        try {
            const product = await Product.findOneWithDeleted(this.filter)
            return format(product)
        } catch (error) {
            console.error(error)
        }
    },
    async products() {
        try {
            const products = await Product.findAll(this.filter)
            const productsPromise = products.map(format)

            return Promise.all(productsPromise)
        } catch (err) {
            console.error(err)
        }
    },
    format
}

module.exports = LoadService