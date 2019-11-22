var express = require('express'),
    router = express.Router(),
    utils = require("../utils"),
    _ = utils._;
module.exports = function (app) {
    var models = app.models;
    router.post('/company', companyDetails);
    router.put('/company', companyDetails);
    router.delete('/company', companyDetails);

    router.post('/appInsert', appsDetails);
    router.post('/usersInsert', userDetails);
    app.server.use('/', app.middlewares.rest());
    app.server.use('/', router);
    //Insert, Update & Delete Company Details
    function companyDetails(req, res) {
        if (req.method == "POST") {
            models.company.insertCompany(req.body)
                .then(company => {
                    if (company.result) {
                        res.status(200).send({ "success": true, "message": "Inserted Successfully" })
                    } else {
                        res.status(400).send({ "success": false, "message": company });
                    }
                })
                .catch(err => {
                    res.status(500).send({ "success": false, "message": err });
                });
        } else if (req.method == "PUT") {
            models.company.updateCompany(req.body)
                .then(updateId => {
                    if (updateId) {
                        res.status(200).send({ "success": true, "message": updateId })
                    } else {
                        res.status(400).send({ "success": false, "message": "No updates" });
                    }
                })
                .catch(err => {
                    res.status(500).send({ "success": false, "message": err });
                });
        } else if (req.method == "DELETE") {
            models.company.companyDetails(req)
                .then(result => {
                    if (result) {
                        res.status(200).send({ "success": true, "message": "Deleted Successfully" })
                    } else {
                        res.status(409).send({ "success": false, "message": "No Records to Delete" });
                    }
                })
                .catch(err => {
                    res.status(500).send({ "success": false, "message": "Error" });
                });
        }
    }

    function appsDetails(req, res){
        models.company.insertApps(req.body)
                .then(company => {
                    if (company) {
                        res.status(200).send({ "success": true, "message": company })
                    } else {
                        res.status(400).send({ "success": false, "message": company });
                    }
                })
                .catch(err => {
                    res.status(500).send({ "success": false, "message": err });
                });
    }

    function userDetails(req, res){
        models.company.insertUsers(req.body)
                .then(company => {
                    if (company) {
                        res.status(200).send({ "success": true, "message": company })
                    } else {
                        res.status(400).send({ "success": false, "message": company });
                    }
                })
                .catch(err => {
                    res.status(500).send({ "success": false, "message": err });
                });
    }
}