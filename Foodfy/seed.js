const faker = require('faker')
const { randomBytes } = require('crypto')
const { hash } = require('bcryptjs')

const User = require('../models/users')
const mailer = require('../../lib/mailer')


async function createUsers() {
    const users = []
}