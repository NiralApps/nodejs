var express = require('express'),
    router = express.Router(),
    utils = require("../utils"),
    _ = utils._;
module.exports = function (app) {
    var models = app.models;
    router.post('/log', logDetails);
    router.post('/getLogDetailsById', getlogDetails);
    router.post('/getAllLogList', getAllLogList);
    app.server.use('/', app.middlewares.rest());
    app.server.use('/', router);
    function logDetails(req, res) {
        if (req.method == "POST") {
            models.log.insertlog(req.body)
                .then(response => {
                    if (response.result) {
                        // res.status(201).send(result);
                        res.status(200).send({ "success": true, "message": "Inserted Successfully" })
                    } else {
                        res.status(409).send({ "success": false, "message": response });
                    }
                })
                .catch(err => {
                    res.status(500).send({ "success": false, "message": err });
                });
        }
    }

    // Get Log Details By Particular App Id
    function getlogDetails(req, res) {
        models.log.getlogDetails(req.body)
            .then(response => {
                if (response) {
                    // res.status(201).send(result);
                    res.status(200).send(response)
                } else {
                    res.status(409).send(response);
                }
            })
            .catch(err => {
                res.status(500).send(err);
            });
    }

    function getAllLogList(req, res) {
        models.log.getAllLogList(req.body)
            .then(response => {
                if (response) {
                    // res.status(201).send(result);
                    res.status(200).send(response)
                } else {
                    res.status(409).send(response);
                }
            })
            .catch(err => {
                res.status(500).send(err);
            });
    }
}