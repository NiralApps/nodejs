require("string").extendPrototype();
var utils = require('../utils'),
    _ = utils._;
var express = require('express');
var apps = express();
var jwt = require('json-web-token');
var jwt1 = require('jsonwebtoken');
module.exports = function (app) {
    return {
        rest: function rest() {
            var TokenCollection = app.db.collection("company_info");
            var config = require('../config');
            var passwordHash = require('password-hash');
            var access_token;
            // var decodedPayload;
            apps.set('superSecret', config.secret);
            return function (req, res, next) {
                if (req.method == "OPTIONS") {
                    res.status(200).send();
                    return;
                }
                var responseHeaders = {
                    "access-control-allow-origin": "*",
                    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Accept, accessToken",
                    "access-control-max-age": 3600,
                    "Content-Type": "application/json"
                };
                if (req.originalUrl == "/login" || req.originalUrl == "/logger" || req.originalUrl == "/company" || req.originalUrl == "/getAllLogList" || req.originalUrl == "/log") {
                    next();
                    return;
                } else {
                    if (req && req.headers && req.headers.accesstoken) {
                        var code = null;
                        if (req.headers) {
                            decodeToken(req.headers.accesstoken).then(result => {
                                if (result.success) {
                                    if(req.originalUrl == "/getUserInfo"){
                                        res.status(200).send(result)
                                    }else{
                                        next();
                                    }
                                    // return resolve({ "success": true })
                                } else {
                                    res.status(401).send({ error: result });
                                }
                            })
                                .catch(err => {
                                    res.status(401).send({ error: err });
                                });
                            // next();
                        } else {
                            res.status(401).send({ error: 'Error' });
                        }
                    } else {
                        res.status(401).send({ error: 'Missing Authorization Header' });
                    }
                }
            }
            function decodeToken(accesstoken) {
                return new Promise((resolve, reject) => {
                    jwt1.verify(accesstoken, apps.get('superSecret'), function(err, decoded) {
                        if(err){
                            var error = {
                                "expiredAt" : err['expiredAt'],
                                "msg" : err['name']
                            }
                            resolve(error)
                        } else {
                            validateUser(decoded)
                                .then(result => {
                                    if (result.success) {
                                        resolve({ "success": true , "msg" : result['msg'] })
                                    }
                                })
                                .catch(err => {
                                    reject({ "error": "Failure" })
                                });
                        }
                      });
                });
            }
            function validateUser(data) {
                return new Promise((resolve, reject) => {
                    // resolve({ "success": true })
                    //Check user is valid or not
                    TokenCollection.findOne({ "company_id": data.company_id}, function (err, docs) {
                        if (docs != null) {
                            resolve({ "success": true , "msg" : data })
                        } else {
                            reject({ "error": "Failure" })
                        }
                    });
                })
            }
        }
    }
}