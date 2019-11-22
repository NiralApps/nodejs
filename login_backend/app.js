var database = require("./db"),
    middlewares = require("./middleware"),
    routes = require("./routes"),
    models = require("./models"),
    server = require("./server"),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    nodemailer = require('nodemailer'),
    premailer = require('premailer-api'),
    fs = require('fs');
var app = {};
database.connect(app)
    .then(models.install)
    .then(server.install)
    .then(middlewares.install)
    .then(routes.install)
    .then(server.start)
    .then(app =>{
        console.log("Server started");
    })
    .catch(err => {
        console.log(err);
        // process.exit();
    });