const cursos = document.querySelectorAll(".curso")
const modalOverlay = document.querySelector('.modalOverlay')
const iframe = document.querySelector(".iframe iframe")
for (const curso of cursos) {
    curso.addEventListener("click", () => {
        const cursoName = curso.id
        iframe.src = `https://rocketseat.com.br/${cursoName}`
        modalOverlay.classList.add('maximize')
    })
}

modalOverlay.querySelector('.close-modal').addEventListener("click", () => {
    if (modalOverlay.classList.contains('maximize')) {
        modalOverlay.classList.remove('maximize')
        iframe.src = '' 
    }
})