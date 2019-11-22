var express = require('express'),
    router = express.Router(),
    utils = require("../utils"),
    _ = utils._;
module.exports = function (app) {
    var models = app.models;
    // router.get('/getAllLogDetails', getAllLogDet);
    router.post('/getCompanyAppDetails',getCompanyAppDetails)
    router.post('/getCompanyUserDetails',getCompanyUserDetails)
    router.post('/getCompanyDetails',getCompanyDetails)
    router.get('/getUserInfo',getUserInfo)
    router.get('/logDetails', dashboardLog);
    router.get('/filter', dashboardFilter);
    app.server.use('/', app.middlewares.rest());
    app.server.use('/', router);
    function dashboardApps(req, res) {
        if (req.method == "GET") {
            models.dashboard.dashboardApps(req)
                .then(response => {
                    if (response.success) {
                        // res.status(201).send(result);
                        res.status(200).send({ "success": true, "message": "Company Details Received", "data":response.data })
                    } else {
                        res.status(409).send({ "success": false, "message": "Company Details Not Received" });
                    }
                })
                .catch(err => {
                    res.status(500).send({ "success": false, "message": "Error" });
                });
        }
    }
    function dashboardLog(req, res) {
        if (req.method == "GET") {
            models.dashboard.dashboardLog(req)
                .then(response => {
                    if (response.success) {
                        // res.status(201).send(result);
                        res.status(200).send({ "success": true, "message": "Log Details Received", "data":response.data })
                    } else {
                        res.status(409).send({ "success": false, "message": "Log Not Received" });
                    }
                })
                .catch(err => {
                    res.status(500).send({ "success": false, "message": "Error" });
                });
        }
    }
    function dashboardFilter(req, res) {
        if (req.method == "GET") {
            models.dashboard.dashboardFilter(req)
                .then(response => {
                    if (response.success) {
                        res.status(200).send({ "success": true, "message": "Search Successful" })
                    } else {
                        res.status(409).send({ "success": false, "message": "No Results" });
                    }
                })
                .catch(err => {
                    res.status(500).send({ "success": false, "message": "Error" });
                });
        }
    }

    // Get Company Application Details
    function getCompanyAppDetails(req,res){
        models.dashboard.getCompanyAppDetails(req.body)
        .then(response => {
            if (response) {
                res.status(200).send(response)
            } else {
                res.status(409).send(response);
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
    }

    function getCompanyUserDetails(req,res){
        models.dashboard.getCompanyUserDetails(req.body)
        .then(response => {
            if (response) {
                res.status(200).send(response)
            } else {
                res.status(409).send(response);
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
    }

    // Get Company Details
    function getCompanyDetails(req,res){
        models.dashboard.getCompanyDetails(req.body)
        .then(response => {
            if (response) {
                res.status(200).send(response)
            } else {
                res.status(409).send(response);
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
    }

    // Get User Information 
    function getUserInfo(req,res){
        models.dashboard.getUserInfo(req.headers.accesstoken)
        .then(response => {
            if (response) {
                res.status(200).send(response)
            } else {
                res.status(409).send(response);
            }
        })
        .catch(err => {
            res.status(500).send(err);
        });
    }

    function getAllLogDet(req, res){
            models.dashboard.getAllLogDetails(req.body)
                .then(response => {
                    if (response) {
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