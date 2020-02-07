// change recipe
const receitas = document.querySelectorAll(".recipes .card")

for (let i = 0; i < receitas.length; i++) {
    receitas[i].querySelector('img').addEventListener("click", function() {
        window.location.href = `/recipes/${i}`
    })
}

// show/hide

const showHides = document.getElementsByClassName('topic');

for (let showHide of showHides) {
    const buttonH4 = showHide.querySelector('h4');

    buttonH4.addEventListener('click', function () {
        if (buttonH4.innerHTML == "ESCONDER") {
            showHide.querySelector('.topic-content').classList.add('hidden');
            buttonH4.innerHTML = "MOSTRAR"
            
        } else {
            showHide.querySelector('.topic-content').classList.remove('hidden');
            buttonH4.innerHTML = "ESCONDER"
        }

    })
}

// Add Bold

const menuItems = document.querySelectorAll('header .menus a');
const currentPage = window.location.pathname
for (const items of menuItems) {
    if (currentPage.includes(items.getAttribute('href'))) {
        items.classList.add("active");
    }
}

// Delete confirmation

const formDelete = document.querySelector('.recipe-controller');

if(formDelete) {
    formDelete.addEventListener("submit", e => {
        const confirmation = confirm("Deseja mesmo deletar?");
        
        if (!confirmation) e.preventDefault();
    })
}