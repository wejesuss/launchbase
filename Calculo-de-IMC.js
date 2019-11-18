const person = {
    name: 'Carlos',
    weight: 70, // Weight in Kg
    height: 1.7 // Height in meters
}

function calculateBMI(person) {
    const bmi = (1.3 * person.weight) / Math.pow(person.height, 2.5)
    if (bmi >= 30) {
        console.log('You are obese')
    } else if (bmi > 25) {
        console.log('You are overweight')
    } else if (bmi <= 19) {
        console.log('You are underweight')
    } else {
        console.log('Great! You are not overweight')
    }
}

calculateBMI(person)

