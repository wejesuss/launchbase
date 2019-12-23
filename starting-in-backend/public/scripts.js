const cards = document.querySelectorAll(".card")
const modalOverlay = document.querySelector(".modal-overlay")

for (let card of cards) {
    let videoId = card.querySelector("div").id
    card.addEventListener("click", function(){
        
    window.location.href = `/video?id=${videoId}`
    
    })
}


