const cards = document.querySelectorAll(".card")
const modalOverlay = document.querySelector(".modal-overlay")

for (let card of cards) {
    let videoId = card.querySelector("div").id
    card.addEventListener("click", function(){
        modalOverlay.classList.add("active")
        modalOverlay.querySelector("iframe").src = `https://youtube.com/embed/${videoId}`
    })
}

document.querySelector(".close-modal").addEventListener("click", function(){
    modalOverlay.classList.remove("active")
    modalOverlay.querySelector("iframe").src = ""
})

