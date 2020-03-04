module.exports = {
    verifyFieldsOfArray(ArrayOfThings) {
        for (const things of ArrayOfThings) {
            if(things == "") return true
        }
    },
    date(timestamp) {
        const birthDate = new Date(timestamp)

        const year = birthDate.getFullYear()
        const month = `0${birthDate.getMonth() + 1}`.slice(-2)
        const day = `0${birthDate.getDate()}`.slice(-2)
        
        return {
            iso:`${year}-${month}-${day}`,
            birthDay:`${day}/${month}`,
            format:`${day}/${month}/${year}`
        }
    }
}