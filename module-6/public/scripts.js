const Mask = {
    apply(input, func) {
        setTimeout(() => {
            input.value = Mask[func](input.value)
        }, 1);
    },
    formatBRL(value) {        
        value = value.replace(/\D/g,"")
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value/100)
    }
}

const PhotosUpload = {
    uploadLimit: 6,
    input: "",
    files: [],
    preview: document.querySelector('#photos-preview'),
    handleFileInput(event) {
        const { files: fileList } = event.target
        PhotosUpload.input = event.target
        
        if(PhotosUpload.hasLimit(event)) return

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
        
        PhotosUpload.input.files = PhotosUpload.getAllFiles()
    },
    getAllFiles() {
        const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer()

        PhotosUpload.files.forEach(file => dataTransfer.items.add(file))
        return dataTransfer.files
    },
    hasLimit(event) {
        const { input, preview } = PhotosUpload
        const { files: fileList } = input
        
        if (fileList.length > this.uploadLimit) {
            alert(`Envie no máximo ${this.uploadLimit} fotos!`)
            PhotosUpload.input.files = PhotosUpload.getAllFiles()
            event.preventDefault()
            return true
        }
        
        const photosDiv = []
        preview.childNodes.forEach(item => {
            if(item.classList && item.classList.value == 'photo')
                photosDiv.push(item)
        })

        const totalPhotos = fileList.length + photosDiv.length

        if(totalPhotos > this.uploadLimit) {
            alert(`Você atingiu o máximo de ${this.uploadLimit} fotos!`)
            PhotosUpload.input.files = PhotosUpload.getAllFiles()
            event.preventDefault()
            return true
        }

        return false
    },
    getContainer(image) {
        const div = document.createElement('div')
        div.classList.add('photo')

        div.onclick = PhotosUpload.removePhoto
        
        div.appendChild(image)
        div.appendChild(PhotosUpload.getRemoveButton())

        return div
    },
    getRemoveButton() {
        const button = document.createElement('i')
        button.classList.add('material-icons')
        button.innerHTML = 'close'
        
        return button
    },
    removePhoto(event) {
        const photoDiv = event.target.parentNode // <div class='photos'>
        let photosArray = Array.from(PhotosUpload.preview.children)
        const index = photosArray.indexOf(photoDiv)
        
        PhotosUpload.files.splice(index, 1)
        PhotosUpload.input.files = PhotosUpload.getAllFiles()

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
