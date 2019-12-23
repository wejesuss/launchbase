const showHides = document.getElementsByClassName('topic')

for (let showHide of showHides) {
    const buttonH4 = showHide.querySelector('h4')

    buttonH4.addEventListener('click', function () {
        if (buttonH4.innerHTML == "ESCONDER") {
            showHide.querySelector('.topic-content').classList.add('hidden')
            buttonH4.innerHTML = "MOSTRAR"
            
        } else {
            showHide.querySelector('.topic-content').classList.remove('hidden')
            buttonH4.innerHTML = "ESCONDER"
        }

    })
}



