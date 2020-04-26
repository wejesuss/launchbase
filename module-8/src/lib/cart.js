const { formatPrice } = require('./utils')

const Cart = {
    init(oldCard) {
        if(oldCard) {
            this.items = oldCard.items
            this.total = oldCard.total
        } else {
            this.items = []
            this.total = {
                quantity: 0,
                price: 0,
                formattedPrice: formatPrice(0)
            }
        }

        return this
    },
    addOne(product) {
        let inCart = this.getCartItem(product.id)

        if(!inCart) {
            inCart = {
                product: {
                    ...product,
                    formattedPrice: formatPrice(product.price)
                },
                price: 0,
                quantity: 0,
                formattedPrice: formatPrice(0)
            }
            this.items.push(inCart)
        }

        if(inCart.quantity >= product.quantity) return this

        inCart.quantity++
        inCart.price = product.price * inCart.quantity
        inCart.formattedPrice = formatPrice(inCart.price)

        this.total.quantity++
        this.total.price += inCart.product.price
        this.total.formattedPrice = formatPrice(this.total.price)

        return this
    },
    removeOne(productId) {
        let inCart = this.getCartItem(productId)

        if(!inCart) return this

        inCart.quantity--
        inCart.price = inCart.product.price * inCart.quantity
        inCart.formattedPrice = formatPrice(inCart.price)

        this.total.quantity--
        this.total.price -= inCart.product.price
        this.total.formattedPrice = formatPrice(this.total.price)

        if(inCart.quantity < 1) {
            this.items = this.items.filter(item => item.product.id != productId)
            return this
        }

        return this
    },
    delete(productId) {
        let inCart = this.getCartItem(productId)

        if(!inCart) return this

        if(this.items.length > 0) {
            this.total.quantity -= inCart.quantity
            this.total.price -= inCart.price
            this.total.formattedPrice = formatPrice(this.total.price)
        }
        
        this.items = this.items.filter(item => item.product.id != productId)

        return this
    },
    getCartItem(productId) {
        return this.items.find(item => item.product.id == productId)        
    },
    removeAll() {
        this.items = []
        this.total = {
            quantity: 0,
            price: 0,
            formattedPrice: formatPrice(0)
        }

        return this
    }
}

module.exports = Cart