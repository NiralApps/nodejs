// import { resolve } from "path";
'use strict';
var mongo = require("mongodb"),
    ObjectId = mongo.ObjectId,
    utils = require("../utils"),
    _ = utils._;
const INVALID_ARGUMENTS = "Please enter valid arguments.";
module.exports = function (db) {
    var companyCollection = db.collection("company_info");
    var uniqid = require('uniqid');
    
    var passwordHash = require('password-hash');
    var bcrypt = require('bcrypt');
    const saltRounds = 10;
    var model = {};
    var obj = {};
    model.changePassword = changePassword;
    return model;
    // changePassword
    function changePassword(data) {
        console.log(data);
        var oldPassword = data.oldPassword;
        var newPassword = data.newPassword;
        var company_id = data.company_id;
        var user_id = data.user_id;
        console.log(oldPassword);
        console.log(newPassword);
        console.log(company_id);
        console.log(user_id);
        return new Promise((resolve, reject) => {
            companyCollection.findOne({ "company_id": company_id }, function (err, docs) {
                console.log("docs", docs);
                if (docs != null) {
                    console.log("docs", docs);
                    var getUser = docs['users']
                    for (var i = 0; i < getUser.length; i++) {
                        var hashedPassword = getUser[i]['password'];
                        // var pass = passwordHash.verify(data.password, hashedPassword);
                        var pass = bcrypt.compareSync(oldPassword, hashedPassword);
                        if (user_id == getUser[i]['id'] && pass == true) {
                            console.log("Success");
                            var salt = bcrypt.genSaltSync(saltRounds);
                            var hash = bcrypt.hashSync(newPassword, salt);
                            console.log("hash",hash);
                            getUser[i]['password'] = hash;
                            //     var tokenObj = {
                            //         "company_id": docs.company_id,
                            //         "_id": getUser[i]['id'],
                            //         "first_name" : getUser[i]['first_name'],
                            //         "last_name" : getUser[i]['last_name'],
                            //         "email_id" : getUser[i]['email_id'],
                            //         "created_datetime" : getUser[i]['created_datetime']
                            //     };
                            //     var token1 = jwt1.sign(tokenObj, app.get('superSecret'), {
                            //         // expiresIn: 86400 // expires in 24 hours
                            //         expiresIn: 7200
                            //     });
                            //     getUser[i]['access_token'] = token1
                            //     console.log("token", token1);
                            //     var updateObj = { $set: getUser[i] };
                            // return loginCollection.findOneAndUpdate(
                            //     {
                            //         "compDomain": data['compDomain']
                            //     }, docs, {
                            //         returnOriginal: false
                            //     }).then(result => {
                            //         return resolve({ "success": true, "access_token": token1 });
                            //     }).catch(err => {
                            //         return reject(err);
                            //     });
                        } else {
                            if (i == getUser.length) {
                                return reject({ "failure": "Please Check the Password" })
                            } else {

                            }
                        }
                    }
                    console.log("docs", docs);
                    return companyCollection.findOneAndUpdate(
                        { "company_id": company_id }, docs, {
                                returnOriginal: false
                            }).then(result => {
                                return resolve({ "success": true, "message": "Updated Successfully!!!" });
                            }).catch(err => {
                                return reject(err);
                            });
                } else {
                    return reject({ "error": "Failure" })
                }
            }
            );
        });
    }
}