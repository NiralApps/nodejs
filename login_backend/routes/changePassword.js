var express = require('express'),
    router = express.Router(),
    utils = require("../utils"),
    _ = utils._;
module.exports = function (app) {
    var models = app.models;
    router.post('/changePassword', changePassword);
    app.server.use('/', app.middlewares.rest());
    app.server.use('/', router);
    //Change Paasword
    function changePassword(req, res) {
        models.changePassword.changePassword(req.body)
            .then(result => {
                if (result) {
                    res.status(200).send({ "success": true, "message": result })
                } else {
                    res.status(400).send({ "success": false, "message": result });
                }
            })
            .catch(err => {
                res.status(500).send({ "success": false, "message": err });
            });
    }
}