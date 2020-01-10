module.exports = {
    age: function (timestamp) {
        const birthDate = new Date(timestamp)
        const today = new Date
        let age = today.getFullYear() - birthDate.getFullYear()
        const month = today.getMonth() - birthDate.getMonth()
        
        return month < 0 || month == 0 && today.getDate() <= birthDate.getDate() ? age -= 1 : age
    },
    date: function (timestamp) {
        const birthDate = new Date(timestamp)

        const year = birthDate.getUTCFullYear()
        const month = `0${birthDate.getUTCMonth() + 1}`.slice(-2)
        const day = `0${birthDate.getUTCDate()}`.slice(-2)
        
        return {
            iso: `${year}-${month}-${day}`,
            birthDay: `${day}/${month}`
        }
    },
    servicesToArray: function (string) {
        const services = string.split(',')
        return services
    },
    servicesToString : function (array) {
        const services = array.join(',')
        return services
    },
    blood: function (bloodType) {
        const Rh = bloodType.slice(-1)
        const group = bloodType.slice(-3, -1)
        return (Rh == "0") ? `${group}+` : `${group}-`
    }
}