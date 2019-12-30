const express = require('express')
const nunjucks = require('nunjucks')
const videos = require("./data")

const server = express()

server.use(express.static('public'))

server.set("view engine", "njk")

nunjucks.configure("views", {
    express: server,
    noCache:true,
    autoescape:false
})

server.get("/", function (req, res) {
    const about = {
        image_url: "https://avatars3.githubusercontent.com/u/6643122?s=460&v=4",
        name: "Mayk Brito",
        role: "Instrutor - Rocketseat",
        description: 'Programador full-stack, focado em trazer o melhor ensino para iniciantes em programação. Colabolador da <a href="https://rocketseat.com.br/" target="_blank" rel="noopener noreferrer">Rocketseat</a>',
        links: [
            { name:"Github", url: "https://github.com/maykbrito" },
            { name:"Twitter", url: "https://twitter.com/maykbrito" },
            { name:"Linkedin", url: "https://br.linkedin.com/in/maykbrito" }
        ]
    }

    return res.render("about", {about})
})

server.get("/portfolio", function (req, res) {
    return res.render("portfolio", { items: videos })
})

server.get("/video", function (req, res) {
    const {id} = req.query

    const video = videos.find(function(video){
        return video.id == id
    })

    if(!video) {
        return res.send("Video not found!")
    }

    return res.render("video", {item:video} )
})

server.listen(5000, function () {

})