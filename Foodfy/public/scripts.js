const PhotosUpload = {
    uploadLimit: 5,
    input: "",
    files: [],
    preview: document.querySelector('#photos-preview'),
    apply(func, params) {
        if(func.includes('Chefs')) PhotosUpload.uploadLimit = 1

        if(PhotosUpload.uploadLimit > 1) {
            PhotosUpload.preview.style.gridTemplateColumns = "repeat(5, 1fr)"
            PhotosUpload.preview.style.width = "80%"
        }
        
        PhotosUpload[func](params)
    },
    handleFileInputChefs(event) {
        const { files: fileList } = event.target
        PhotosUpload.input = event.target
        
        if(PhotosUpload.hasLimit(event)) {
            PhotosUpload.updateInputFiles()
            return
        }

        Array.from(fileList).forEach(file => {
            PhotosUpload.files.push(file)
            
            const reader = new FileReader()
            reader.onload = () => {
                const image = new Image()
                image.src = String(reader.result)

                const div = PhotosUpload.getContainer(image)

                PhotosUpload.preview.appendChild(div)
            }

            reader.readAsDataURL(file)
        })

        PhotosUpload.updateInputFiles()
    },
    hasLimit(event) {
        const { input, preview, uploadLimit } = PhotosUpload
        const { files: fileList } = input

        if(fileList.length > PhotosUpload.uploadLimit) {
            (uploadLimit > 1) ? alert(`Envie no máximo ${PhotosUpload.uploadLimit} fotos!`) : alert(`Envie no máximo ${PhotosUpload.uploadLimit} foto!`)
            event.preventDefault()
            return true
        }

        const photosDiv = []
        preview.childNodes.forEach(item => {
            if(item.classList && item.classList.value == 'photo')
                photosDiv.push(item)
        })

        const totalPhotos = fileList.length + photosDiv.length

        if(totalPhotos > uploadLimit) {
            (uploadLimit > 1) ? alert(`Envie no máximo ${PhotosUpload.uploadLimit} fotos!`) : alert(`Envie no máximo ${PhotosUpload.uploadLimit} foto!`)
            event.preventDefault()
            return true
        }
        
        return false
    },
    getContainer(image) {
        const div = document.createElement('div')
        div.classList.add('photo')
        div.appendChild(image)
        div.appendChild(PhotosUpload.getRemoveButton())

        return div
    },
    getRemoveButton() {
        const button = document.createElement('i')
        button.classList.add('material-icons')
        button.onclick = PhotosUpload.removePhoto
        button.innerHTML = 'close'

        return button
    },
    getAllFiles() {
        const datatransfer = new DataTransfer() || new ClipboardEvent("").clipboardData

        PhotosUpload.files.forEach(file => datatransfer.items.add(file))

        return datatransfer.files
    },
    updateInputFiles() {
        PhotosUpload.input.files = PhotosUpload.getAllFiles()
    },
    removePhoto(event) {
        const photoDiv = event.target.parentNode
        const newFiles = Array.from(PhotosUpload.preview.children).filter(file => {
            if(file.classList.contains('photo') && !file.getAttribute('id')) return true
        })

        const index = newFiles.indexOf(photoDiv)
        PhotosUpload.files.splice(index, 1)
        PhotosUpload.updateInputFiles()
        
        photoDiv.remove()
    },
    removePreviousPhoto(event) {
        const photoDiv = event.target.parentNode
        
        if(photoDiv.id) {
            const removedFiles = document.querySelector('input[name="removed_files"]')
            if(removedFiles) {
                removedFiles.value += `${photoDiv.id},`
            }
        }

        photoDiv.remove()
    },
    handleFileInputRecipes(event) {
        const { files: fileList } = event.target
        PhotosUpload.input = event.target
        
        if(PhotosUpload.hasLimit(event)) {
            PhotosUpload.updateInputFiles()
            return
        }

        Array.from(fileList).forEach(file => {
            PhotosUpload.files.push(file)
            
            const reader = new FileReader()
            reader.onload = () => {
                const image = new Image()
                image.src = String(reader.result)

                const div = PhotosUpload.getContainer(image)

                PhotosUpload.preview.appendChild(div)
            
            }

            reader.readAsDataURL(file)
        })

        PhotosUpload.updateInputFiles()
    }
}

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