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
    },
    cpfCnpj(value) {
        value = value.replace(/\D/g,"")
        
        if(value.length > 14) value = value.slice(0, 14)

        if(value.length > 11) {
            value = value.replace(/(\d{2})(\d)/, "$1.$2")
            
            value = value.replace(/(\d{3})(\d)/, "$1.$2")
            
            value = value.replace(/(\d{3})(\d)/, "$1/$2")
            
            value = value.replace(/(\d{4})(\d)/, "$1-$2")            
        } else {
            value = value.replace(/(\d{3})(\d)/, "$1.$2")
            
            value = value.replace(/(\d{3})(\d)/, "$1.$2")

            value = value.replace(/(\d{3})(\d)/, "$1-$2")
        }

        return value
    },
    cep(value) {
        value = value.replace(/\D/g,"")
        
        if(value.length > 8) value = value.slice(0, 8)
        
        value = value.replace(/(\d{5})(\d)/, "$1-$2")          

        return value
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
        
        const photosHasId = []
        Array.from(this.preview.childNodes).forEach(item => {
            if(item.classList && item.classList.value == 'photo' && item.getAttribute('id')) {
                const alt = item.querySelector('img').alt
                const index = alt.indexOf('-')
                photosHasId.push(alt.slice(index + 1))
            }
        })

        if(PhotosUpload.hasLimit(event)) {
            PhotosUpload.updateInputFiles()
            return
        }

        Array.from(fileList).forEach(file => {
            const alreadyHasImage = PhotosUpload.files.some(image => image.name == file.name)
            const alreadyHadImage = photosHasId.some(name => name == file.name)

            if(!alreadyHasImage && !alreadyHadImage) {
                PhotosUpload.files.push(file)
            } else {
                alert(`Não envie fotos repetidas!`)
                PhotosUpload.updateInputFiles()
                event.preventDefault()
                return
            }
            
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
        button.onclick = PhotosUpload.removePhoto
        button.classList.add('material-icons')
        button.innerHTML = 'close'
        
        return button
    },
    removePhoto(event) {
        const photoDiv = event.target.parentNode // <div class='photos'>
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
    updateInputFiles() {
        PhotosUpload.input.files = PhotosUpload.getAllFiles()
    }
}

const ImageGallery = {
    highlightImage: document.querySelector('.gallery .highlight > img'),
    previews: document.querySelectorAll('.gallery-preview img'),
    setImage(e) {
        const { target } = e

        ImageGallery.previews.forEach(preview => preview.classList.remove('active'))
        target.classList.add('active')

        ImageGallery.highlightImage.src = target.src
        LightBox.image.src = target.src
    }
}

const LightBox = {
    target: document.querySelector('.highlight .lightbox-target'),
    image: document.querySelector('.highlight .lightbox-target img'),
    closeButton: document.querySelector('.lightbox-target .lightbox-close'),
    open() {
        LightBox.target.style.opacity = 1
        LightBox.target.style.top = 0
        LightBox.target.style.bottom = 0
        LightBox.closeButton.style.top = 0
    },
    close() {
        LightBox.target.style.opacity = 0
        LightBox.target.style.top = '-100%'
        LightBox.target.style.bottom = 'initial'
        LightBox.closeButton.style.top = '-80px'
    }
}

//add delete confirmation
const formDelete = document.querySelector("#form_delete")

if(formDelete) {
    formDelete.addEventListener("submit", function (event) {
        const confirmation = confirm("Deseja mesmo excluir? Essa operação não pode ser desfeita!")
        if (!confirmation) {
            event.preventDefault()
        }
    })
}

const Validate = {
    apply(input, func) {
        Validate.clearErrors(input)
        let results = Validate[func](input.value)
        input.value = results.value
        
        if(results.error) Validate.displayErros(input, results.error)
    },
    displayErros(input, error) {
        const div = document.createElement('div')
        div.classList.add('error')
        div.innerHTML = error
        input.parentNode.appendChild(div)
        input.focus()
    },
    clearErrors(input) {
        const errorDiv = input.parentNode.querySelector('.error')

        if(errorDiv) errorDiv.remove()
    },
    isEmail(value) {
        let error = null

        const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

        if(!value.match(mailFormat)) error = "Email inválido"
        

        return {
            error,
            value
        }
    },
    isCpfCnpj(value) {
        let error = null
        const cleanedValues = value.replace(/\D/g,"")
        
        if(cleanedValues.length > 11 && cleanedValues.length !== 14) {
            error = "CNPJ inválido"
        } else if(cleanedValues.length < 12 && cleanedValues.length !== 11) {
            error = "CPF inválido"
        }

        return {
            error,
            value
        }
    },
    isCep(value) {
        let error = null
        const cep = value.replace(/\D/g,"")
        
        if(cep.length !== 8)
            error = "CEP inválido"

        return {
            error,
            value
        }
    },
    isInvalid(event) {
        const invalidCpfCnpj = document.querySelector(".input > div.error")
        
        if(invalidCpfCnpj) {
            alert(`${invalidCpfCnpj.previousElementSibling.value} é inválido`)
            event.preventDefault()
        }
    },
    allFields(event) {
        const items = document.querySelectorAll(".item input, .item select, .item textarea")

        const message = document.createElement('div')
        for (const item of items) {
            if(item.value == '') {
                message.style.position = 'fixed'
                message.classList.add('messages')
                message.classList.add('error')
                message.innerHTML = 'Por favor, preencha todos os campos!'
                
                const divError = document.body.querySelector('div.messages.error')
                if(divError) {
                    divError.parentNode.replaceChild(message, divError)
                }
                document.body.append(message)

                event.preventDefault()
            }
        }

    }
}