const express = require('express')
const nunjucks = require('nunjucks')
const server = express()

const courses = require('./data')

server.set("view engine", "njk")
nunjucks.configure("views", {
  express:server,
  autoescape: false,
  noCache: true
})

server.use(express.static('public'))

server.get("/about", function (req,res){
  const about = {
    avatar_url: "https://avatars0.githubusercontent.com/u/28929274?s=200&v=4",
    name: "Rocketseat",
    description: "As melhores tecnologias em programação, direto ao ponto e do jeito certo.",
    more_information: "No meio de tanta informação e da quantidade de ferramentas que surgem todos os dias, você precisa de alguém que te leve na direção certa.",
    techs: [
      {name: "NodeJS" },
      {name: "React" },
      {name: "React Native" }
    ]
  };
  res.render("sobre", { about })
})

server.get("/course", function (req,res){
   res.render("conteudo", { items: courses})
})


server.get("/courses/:id", function (req, res){
  const id = req.params.id;

  const course = courses.find(function(courses){
    return courses.id == id
 })

  if(!course){
    return res.render("not-found")
  }

  return res.render("course", { item: course})
})

// server.use(function(req, res){
//   res.status(404).render("not-found");
// })

server.listen(5000, function(){
  console.log ("server is running!")
})