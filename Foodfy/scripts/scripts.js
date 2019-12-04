const modaloverlay = document.querySelector('.modal_overlay')
const cards = document.querySelectorAll('.card')

for (let card of cards) {
    card.addEventListener('click', function () {
        modaloverlay.classList.add('active')
        modaloverlay.querySelector('img').src = card.querySelector('img').src
        modaloverlay.querySelector('img').alt = card.querySelector('img').alt
        modaloverlay.querySelector('h4').textContent = card.querySelector('h4').textContent
        modaloverlay.querySelector('p').textContent = card.querySelector('p').textContent

    })

}
modaloverlay.querySelector('a').addEventListener('click', function () {
    modaloverlay.classList.remove('active')
})


