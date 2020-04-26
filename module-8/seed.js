const faker = require('faker')
const { hash } = require('bcryptjs')

const User = require('./src/app/models/User')
const Product = require('./src/app/models/Product')
const File = require('./src/app/models/File')

let totalProducts = 10,
    totalUsers = 3,
    totalFiles = 50

let usersId = [],
    productsId = []

async function createUsers() {
    const users = []
    const password = await hash('123', 8)

    while (users.length < totalUsers) {
        users.push({
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password,
            cpf_cnpj: faker.random.number(99999999999999),
            cep: faker.random.number(99999999),
            address: faker.address.streetName()
        })
    }
    const usersPromise = users.map(user => User.create(user))

    usersId = await Promise.all(usersPromise)

}

async function createProducts() {
    let products = []

    while (products.length < totalProducts) {
        products.push({
            category_id: Math.ceil(Math.random() * 3),
            user_id: usersId[Math.floor(Math.random() * totalUsers)],
            name: faker.name.title(),
            description: faker.lorem.paragraph(Math.ceil(Math.random() * 6)),
            previous_price: faker.random.number(9999),
            price: faker.random.number(9999),
            quantity: faker.random.number(99),
            status: Math.round(Math.random())
        })
    }
    const productsPromise = products.map(product => Product.create(product))

    productsId = await Promise.all(productsPromise)

    let files = []

    while (files.length < totalFiles) {
        files.push({
            name: faker.image.image(),
            path: 'public/images/placeholder.png',
            product_id: productsId[Math.floor(Math.random() * totalProducts)]
        })
    }
    const filesPromise = files.map(file => File.create(file))

    await Promise.all(filesPromise)
}

async function init() {
   await createUsers()
   await createProducts()
}

init()