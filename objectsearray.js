// const empresa = {
//     nome: 'Rocketseat',
//     foco: 'Programação',
//     cor: 'Roxo',
//     endereco: {
//       rua: 'Rua Guilherme Gembala',
//       numero: 260
//     }
//   }
//   console.log(`A empresa ${empresa.nome} está localizada na ${empresa.endereco.rua} com número ${empresa.endereco.numero}`)

const programador01 = {
  nome:'Maria',
  idade: 39,
  tecnologias : [
  { tecnologia: 'Python', especialidade: 'Data Science' },
  { tecnologia: 'C++', especialidade: 'Desktop' },
  { tecnologia: 'JavaScript', especialidade: 'Web/Mobile' }
  ]
}

console.log(`O usuário ${programador01.nome} tem ${programador01.idade} anos e usa a tecnologia ${programador01.tecnologias[0].tecnologia} com especialidade em ${programador01.tecnologias[0].especialidade}`)