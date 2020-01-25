exports.verifyFieldsOfArray = function (ArrayOfThings) {
    for (const things of ArrayOfThings) {
        if(things == "") return true
    }
}