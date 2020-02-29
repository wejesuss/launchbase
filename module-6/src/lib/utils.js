const Intl = require('Intl')

module.exports = {
    date(timestamp) {
        const birthDate = new Date(timestamp)

        const year = birthDate.getFullYear()
        const month = `0${birthDate.getMonth() + 1}`.slice(-2)
        const day = `0${birthDate.getDate()}`.slice(-2)
        const hour = birthDate.getHours()
        const minutes = birthDate.getMinutes()
 
        return {
            day,
            month, 
            year,
            hour,
            minutes,
            iso:`${year}-${month}-${day}`,
            birthDay:`${day}/${month}`,
            format:`${day}/${month}/${year}`
        }
    },
    formatPrice(price) {        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price/100)
    }
}