//pagination

function paginate(selectedPage, totalPages) {
    let pages = [],
        previousPage

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const firstAndLastPage = currentPage == 1 || currentPage == totalPages
        const pageBeforeSelectedPage = currentPage >= selectedPage - 2
        const pageAfterSelectedPage = currentPage <= selectedPage + 2

        if (firstAndLastPage || pageAfterSelectedPage && pageBeforeSelectedPage) {

            if (previousPage && currentPage - previousPage > 2) {
                pages.push('...')
            }

            if (previousPage && currentPage - previousPage == 2) {
                pages.push(previousPage + 1)
            }

            pages.push(currentPage)

            previousPage = currentPage
        }
    }

    return pages
}

const pagination = document.querySelector('.pagination')

function createPagination(pagination) {
    const selectedPage = +pagination.dataset.page
    const total = +pagination.dataset.total
    const filter = pagination.dataset.filter

    const pages = paginate(selectedPage, total)
    let elements = ''
    if (!pages[0]) alert(`Nothing found!`)

    for (let page of pages) {
        if (String(page).includes('...')) {
            elements += `<span>${page}</span>`
        } else {
            if (filter) {
                if (page == selectedPage) {
                    elements += `<a class="active" href="?page=${page}&&filter=${filter}">${page}</a>`
                } else {
                    elements += `<a href="?page=${page}&&filter=${filter}">${page}</a>`
                }
            } else {
                if (page == selectedPage) {
                    elements += `<a class="active" href="?page=${page}">${page}</a>`
                } else {
                    elements += `<a href="?page=${page}">${page}</a>`
                }
            }
        }
    }

    pagination.innerHTML = elements
}

if (pagination) {
    createPagination(pagination)
}

// add search field
const search = document.querySelector('.menus .search')
if (search) {
    if (location.pathname.includes('/chefs') || location.pathname.includes('/about')) {
        search.removeChild(search.querySelector('form'))
    }
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

const menuItems = document.querySelectorAll('.menus a');
const currentPage = window.location.pathname
for (const items of menuItems) {
    if (currentPage.includes(items.getAttribute('href'))) {
        items.classList.add("active");
    }
}

// Delete confirmation

const formDelete = document.querySelector('.delete-form');

if (formDelete) {
    formDelete.addEventListener("submit", e => {
        const confirmation = confirm("Deseja mesmo deletar?");

        if (!confirmation) e.preventDefault();
    })
}