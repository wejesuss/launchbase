const users = [
    { name: 'Carlos', technologies: ['HTML', 'CSS'] },
    { name: 'Jasmine', technologies: ['JavaScript', 'CSS'] },
    { name: 'Tuane', technologies: ['HTML', 'Node.js'] }
]

for (const user of users) {
    const result = `The user ${user.name} works with ${user.technologies.join(', ')}`
    console.log(result)
}
