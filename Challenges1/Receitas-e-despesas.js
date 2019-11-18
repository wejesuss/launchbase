const users = [
    {
        name: 'Salvio',
        revenues: [115.3, 48.7, 98.3, 14.5],
        expenditures: [85.3, 13.5, 19.9]
    },
    {
        name: 'Marcio',
        revenues: [24.6, 214.3, 45.3],
        expenditures: [185.3, 12.1, 120.0]
    },
    {
        name: 'Lucia',
        revenues: [9.8, 120.3, 340.2, 45.3],
        expenditures: [450.2, 29.9]
    }
]

function sumRevenAndExpen(user) {
    let sumReven = 0
    let sumExpen = 0
    let sumArray = []

    for (let i = 0; i < user.revenues.length; i++) {
        sumReven = sumReven + user.revenues[i]
    }

    for (let i = 0; i < user.expenditures.length; i++) {
        sumExpen += user.expenditures[i]
    }

    sumArray.push(sumReven, sumExpen)

    return sumArray
}

function returnBalance(users) {
    let result
    let balances = []

    for (let i = 0; i < users.length; i++) {
        result = sumRevenAndExpen(users[i])
        balances.push(result[0] - result[1])

    }

    return balances
}

function returnName(users) {
    let names = []

    for (let u = 0; u < users.length; u++) {
        names.push(users[u].name)
    }

    return names
}

function sendMessage(balances, names) {

    for (let i = 0; i < names.length; i++) {
        if (balances[i] > 0) {
            console.log(`O Usuário ${names[i]} possui saldo POSITIVO de ${balances[i]}`)
        } else {
            console.log(`O Usuário ${names[i]} possui saldo NEGATIVO de ${balances[i]}`)
        }
    }
}

const names = returnName(users)
const balances = returnBalance(users)
sendMessage(balances, names)