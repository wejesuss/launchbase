// Add bold in the header
const currentPage = location.pathname
const menuItems = document.querySelectorAll("header .links a")

for (const item of menuItems) {
    const href = item.getAttribute("href")
    if(currentPage.includes(href)) {
        item.classList.add("active")
    }
}

//add delete confirmation
const formDelete = document.querySelector("#form_delete")

if(formDelete) {
    formDelete.addEventListener("submit", function (event) {
        const confirmation = confirm("Deseja deletar?")
        if (!confirmation) {
            event.preventDefault()
        }
    })
}

// add pages navigation
function paginate(selectedPage, totalPages) {
    let pages = [],
        previousPage

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const firstAndLastPage = currentPage == 1 || currentPage == totalPages
        const pageAfterselectedPage = currentPage <= selectedPage + 2
        const pageBeforeselectedPage = currentPage >= selectedPage - 2


        if (firstAndLastPage || pageBeforeselectedPage && pageAfterselectedPage) {
            if (previousPage && currentPage - previousPage > 2) pages.push('...')
            if (previousPage && currentPage - previousPage == 2) pages.push(previousPage + 1)

            pages.push(currentPage)

            previousPage = currentPage
        }
    }

    return pages
}

function createPagination(pagination) {
    const page= +pagination.dataset.page
    const total= +pagination.dataset.total
    const filter= pagination.dataset.filter
    const pages = paginate(page, total)

    let elements = ""
    if(!pages[0]) alert(`${filter} not found!`)

    for (let page of pages) {
        if (String(page).includes('...')) {
            elements += `<span>${page}</span>`
        } else {
            if(filter) {
                elements += `<a href="?page=${page}&filter=${filter}">${page}</a>`
            } else {
                elements += `<a href="?page=${page}">${page}</a>`
            }
        }
    }

    pagination.innerHTML = elements
}

const pagination = document.querySelector(".pagination")

if(pagination) {
    createPagination(pagination)
}
