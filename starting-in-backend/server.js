const express = require('express')
const server = express()


server.get("/", function(req, res) {
    return res.send("Hi")
})

server.listen(5000, function() {
    console.log("server")
})