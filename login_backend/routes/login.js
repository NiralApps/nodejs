var express = require('express'),
    router = express.Router(),
    utils = require("../utils"),
    _ = utils._;
module.exports = function (app) {
    var models = app.models;
    router.post('/login', login);
     app.server.use('/', app.middlewares.rest());
    app.server.use('/', router);

    // For Login
    function login(req, res) {
        if (req.method == "POST") {
            models.login.login(req)
                .then(result => {
                    if (result.success) {
                        res.status(200).send({ "success": true, "message": "Login Successful", "access_token": result.access_token })
                    } else {
                        res.status(409).send({ "success": false, "message": "Error in login" });
                    }
                })
                .catch(err => {
                    res.status(500).send({ "success": false, "message": err });
                });
        }
    }
}