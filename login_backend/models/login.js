'use strict';
var mongo = require("mongodb"),
    ObjectId = mongo.ObjectId,
    utils = require("../utils"),
    _ = utils._;
var express = require('express');
var app = express();
var jwt = require('json-web-token');
var jwt1 = require('jsonwebtoken');
var moment = require('moment');
const INVALID_ARGUMENTS = "Please enter valid arguments.";
module.exports = function (db) {
    var loginCollection = db.collection("company_info");
    var passwordHash = require('password-hash');
    var bcrypt = require('bcrypt');
    const saltRounds = 10;
    var config = require('../config');
    var access_token;
    app.set('superSecret', config.secret);
    //  var passwordHash = require('./lib/password-hash');
    var model = {};
    var obj = {};
    model.login = login;
    return model;
    //Insert, Update & Delete Company Details
    function login(data) {
        if (data.method == "POST") {
            return loginDetails(data.body);
        }
    }

    // Get Access Token when Login
    function loginDetails(data) {
        var objField = {}
        if (data['compDomain']) {
            objField['compDomain'] = data['compDomain']
        }
        return new Promise((resolve, reject) => {
            loginCollection.findOne(objField, function (err, docs) {
                if (docs != null) {
                    console.log("docs", docs);
                    
                    var getUser = docs['users']
                    for (var i = 0; i < getUser.length; i++) {
                        var hashedPassword = getUser[i]['password'];
                        // var pass = passwordHash.verify(data.password, hashedPassword);
                        var pass = bcrypt.compareSync(data.password, hashedPassword);
                        if (data['user_id'] == getUser[i]['id'] && pass == true) {
                            var tokenObj = {
                                "company_id": docs.company_id,
                                "_id": getUser[i]['id'],
                                "first_name" : getUser[i]['first_name'],
                                "last_name" : getUser[i]['last_name'],
                                "email_id" : getUser[i]['email_id'],
                                "created_datetime" : getUser[i]['created_datetime']
                            };
                            var token1 = jwt1.sign(tokenObj, app.get('superSecret'), {
                                // expiresIn: 86400 // expires in 24 hours
                                expiresIn: 7200
                            });
                            getUser[i]['access_token'] = token1
                            console.log("token", token1);
                            var updateObj = { $set: getUser[i] };
                        return loginCollection.findOneAndUpdate(
                            {
                                "compDomain": data['compDomain']
                            }, docs, {
                                returnOriginal: false
                            }).then(result => {
                                return resolve({ "success": true, "access_token": token1 });
                            }).catch(err => {
                                return reject(err);
                            });
                        } else{
                            if(i == getUser.length){
                                return reject({ "failure": "Please Check the Password" })
                            } else {

                            } 
                        }
                    } 
                    return reject({ "failure": "Please Check the User Id / Password" })
                } else {
                    return reject({ "error": "Failure" })
                }
            }
            );
        });
    }
}