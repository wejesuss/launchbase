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
    },
    formatCpfCnpj(value) {
        value = value.replace(/\D/g,"")
        
        if(value.length > 14) value = value.slice(0, 14)

        if(value.length > 11) {
            value = value.replace(/(\d{2})(\d)/, "$1.$2")
            
            value = value.replace(/(\d{3})(\d)/, "$1.$2")
            
            value = value.replace(/(\d{3})(\d)/, "$1/$2")
            
            value = value.replace(/(\d{4})(\d)/, "$1-$2")            
        } else {
            value = value.replace(/(\d{3})(\d)/, "$1.$2")
            
            value = value.replace(/(\d{3})(\d)/, "$1.$2")

            value = value.replace(/(\d{3})(\d)/, "$1-$2")
        }

        return value
    },
    formatCep(value) {
        value = value.replace(/\D/g,"")
        
        if(value.length > 8) value = value.slice(0, 8)
        
        value = value.replace(/(\d{5})(\d)/, "$1-$2")      

        return value
    }
}