module.exports = {
    date(timestamp) {
        const birthDate = new Date(timestamp)

        const year = birthDate.getUTCFullYear()
        const month = `0${birthDate.getUTCMonth() + 1}`.slice(-2)
        const day = `0${birthDate.getUTCDate()}`.slice(-2)
        
        return {
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