const usuarios = [
  { nome: 'Carlos', tecnologias: ['HTML', 'CSS'] },
  { nome: 'Jasmine', tecnologias: ['JavaScript', 'CSS'] },
  { nome: 'Tuane', tecnologias: ['HTML', 'Node.js'] }
]

function buscaUsuariosComCSS() {
  const usuariosComCSS = [] // Essa variavel será preenchida com o nome do usuario que tiver CSS como tecnologia

  for (let u = 0; u < usuarios.length; u++) {
    for (let t = 0; t < usuarios[u].tecnologias.length; t++) {
      if (usuarios[u].tecnologias[t] === 'CSS') {
        usuariosComCSS.push(usuarios[u].nome) // empurra o nome do usuario que tem CSS na lista usuariosComCSS 
      }
    }
  }

  return usuariosComCSS; // retorna a lista completa de usuarios com CSS
}
const usuariosComCSS = buscaUsuariosComCSS(usuarios)
for (let index = 0; index < usuariosComCSS.length; index++) {
  console.log(`O usuário ${usuariosComCSS[index]} trabalha com CSS`)
}