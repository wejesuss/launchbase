const turmaA = [
    { nome: 'aluno01', nota: 5.8 },
    { nome: 'aluno02', nota: 5.8 },
    { nome: 'aluno03', nota: 1.8 }
]

const turmaB = [
    { nome: 'aluno04', nota: 5 },
    { nome: 'aluno05', nota: 3.5 },
    { nome: 'aluno06', nota: 5.5 },
    { nome: 'aluno07', nota: 8 }
]

function calculaMedia(alunos) {
    let soma = 0
    for (let aluno of alunos) {
        soma += aluno.nota
    }
    const media = soma / alunos.length
    return media
}

function mensagemTurma(media, nomeTurma) {
    if (media > 5) {
        console.log(`A média da turma ${nomeTurma} é ${media}. Parabéns!`)
    } else {
        console.log(`A média da turma ${nomeTurma} é menor que 5`)
    }
}

function marcaALunoReprovado(aluno) {
    aluno.reprovado = false
    if (aluno.nota < 5) {
        aluno.reprovado = true
    }
}

function messagemAlunoReprovado(aluno) {
    if (aluno.reprovado) {
        console.log(`O aluno ${aluno.nome} está reprovado`)
    }
}

function alunosReprovado(alunos) {
    for (let aluno of alunos) {
        marcaALunoReprovado(aluno)
        messagemAlunoReprovado(aluno)
    }
}

const media1 = calculaMedia(turmaA)
const media2 = calculaMedia(turmaB)

mensagemTurma(media1, 'turmaA')
mensagemTurma(media2, 'turmaB')
alunosReprovado(turmaA)
alunosReprovado(turmaB)

