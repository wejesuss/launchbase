const nome = 'Maria'
const sexo = 'F'
const idade = 55
const contribuicao = 35

const tempoMinContribuicaoH = 35
const tempoMinContribuicaoM = 30

const regraIdadeEContribuicaoH = (idade + contribuicao) >= 95
const regraIdadeEContribuicaoM = (idade + contribuicao) >= 85

const podeAposentarH = sexo == 'M' && regraIdadeEContribuicaoH && contribuicao >= tempoMinContribuicaoH
const podeAposentarM = sexo == 'F' && regraIdadeEContribuicaoM && contribuicao >= tempoMinContribuicaoM

if (podeAposentarH || podeAposentarM) {
    console.log(`${nome} pode se aposentar`)
} else {
    console.log(`${nome} não pode se aposentar`)
}