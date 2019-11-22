var express = require('express'),
    router = express.Router(),
    utils = require("../utils"),
    _ = utils._;
var app = express();
var path = require("path");
module.exports = function (app) {
    var models = app.models;
    router.get('/logger', logger);
    app.server.use('/', router);
    function logger(req, res) {
        res.sendFile(path.join(__dirname + '/../www/index.html'));
    }
}