const currentPage = location.pathname
const menuItems = document.querySelectorAll("header .links a")


for (const item of menuItems) {
    const href = item.getAttribute("href")
    if(currentPage.includes(href)) {
        item.classList.add("active")
    }
}

const formDelete = document.querySelector("#form_delete")
formDelete.addEventListener("submit", function (event) {
    const confirmation = confirm("Deseja deletar?")
    if (!confirmation) {
        event.preventDefault()
    }
})


