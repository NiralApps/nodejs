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

    model.insertCompany = insertCompany;
    model.insertApps = insertApps;
    model.insertUsers = insertUsers;
    model.updateCompany = updateCompany;
    model.deleteCompany = deleteCompany;
    model.getCount = getCount;
    return model;

    // Insert Company with details
    function insertCompany(data) {
        obj = {};
        var objSearch = {}
        var valField = validateFieldForCompany(data)
        if (valField == true) {
            return companyCollection.find({ "company_name": data.company_name }).sort({ "_id": -1 }).skip(0).limit(10000).toArray()
                .then(companyList => {
                    obj._id = ObjectId();
                    obj.company_name = data.company_name;
                    obj.company_id = data.company_name.substring(0, 2).toUpperCase() + ("000" + (1));
                    obj.compDomain = data.compDomain;
                    obj.created_datetime = new Date()
                    return companyCollection.insert(obj);
                   
                }).catch(err => {
                    return "Company Name is Already In List";
                });
        } else {
            return Promise.reject(valField);
        }
    }

    // Add Application with their details
    function insertApps(data) {
        obj = {};
        var objSearch = {}
        var valField = validateFieldForApps(data)
        if (valField == true) {
            return new Promise((resolve, reject) => {
                return companyCollection.findOne({ "company_name": data.company_name }, function (err, companyList) {
                    if(companyList){
                        if(companyList['apps']){
                            var compAppsLength = companyList['apps'].length + 1
                        } else{
                            var compAppsLength = 1
                        }
                        var apps = []
                        var dataApps = {
                            "_id": ObjectId(),
                            "name": data.apps['name'],
                            "id": data.company_name.substring(0, 2).toUpperCase() + data.apps['name'].substring(0, 3).toUpperCase() + ("00" + (compAppsLength)),
                            "comp_id" : data.company_id,
                            "app_logo": data.apps['app_logo'] ? data.apps['app_logo'] : null,
                            "seckey": uniqid('sec'),
                            "cliendId": uniqid('cli'),
                            "created_datetime": new Date()
                        }
                        apps.push(dataApps)
                        obj.apps = apps;
                        if (companyList['apps']) {
                            var compLength = companyList['apps']
                            compLength.push(dataApps)
                        } else {
                            companyList['apps'] = [dataApps]
                        }
    
                        var updateObj = { $set: companyList };
                        return companyCollection.findOneAndUpdate(
                            {
                                "company_id": data.company_id
                            }, companyList, {
                                returnOriginal: false
                            }).then(result => {
                                if (result.value) {
                                    return resolve("Successfully updated");
                                }
                                else {
                                    return reject("Not updated" );
                                }
                            })
                    } else {
                        
                    }
                });
            });
            
        } else {
            return Promise.reject(valField);
        }
    }

    // Add User details
    function insertUsers(data) {
        obj = {};
        var objSearch = {}
        var generatePass;
        var valField = validateField(data)
        if (valField == true) {
            return new Promise((resolve, reject) => {
                return companyCollection.findOne({ "company_name": data.company_name }, function (err, companyList) {
                    if (companyList) {
                        if(companyList['users']){
                            var compUserLength = companyList['users'].length + 1
                        } else{
                            var compUserLength = 1
                        }
                        var users = []
                        var dataUsers = {
                            "_id": ObjectId(),
                            "first_name": data.users['first_name'],
                            "last_name": data.users['last_name'],
                            "id": data.company_name.substring(0, 2).toUpperCase() + data.users['first_name'].substring(0, 3).toUpperCase() + ("00" + (compUserLength)),
                            "comp_id" : data.company_id,
                            "email_id": data.users['email_id'],
                            "password": bcrypt.hashSync(data.users['password'], saltRounds),
                            "created_datetime": new Date()
                        }
                        console.log("dataUsers",dataUsers)
                        users.push(dataUsers)
                        obj.users = users;
                        if (companyList['users']) {
                            var compLength = companyList['users']
                            compLength.push(dataUsers)
                        } else {
                            companyList['users'] = [dataUsers]
                        }
    
                        var updateObj = { $set: companyList };
                        return companyCollection.findOneAndUpdate(
                            {
                                "company_id": data.company_id
                            }, companyList, {
                                returnOriginal: false
                            }).then(result => {
                                return resolve("Successfully updated");
                            }).catch(err => {
                                return reject(err);
                            });
                    } else {
                        console.log("Err",err)
                    }
                });
            });
        } else {
            return Promise.reject(valField);
        }
    }

    // Validate field for Users
    function validateField(obj) {
        if (obj.users['first_name'] == "" || obj.users['first_name'] == undefined) {
            return "Please Enter User First Name"
        } else if (obj.users['last_name'] == "" || obj.users['last_name'] == undefined) {
            return "Please Enter User Last Name"
        } else if (obj.users['email_id'] == "" || obj.users['email_id'] == undefined) {
            return "Please Enter User Email ID"
        } else if (obj.users['password'] == "" || obj.users['password'] == undefined) {
            return "Please Enter User Password"
        } else {
            return true
        }
    }

    // Validate field for Company
    function validateFieldForCompany(obj) {
        if (obj.company_name == "" || obj.company_name == undefined) {
            return "Please Enter Company Name"
        } else {
            return true
        }
    }

    // Validate field for Application 
    function validateFieldForApps(obj) {
        if (obj.apps['name'] == "" || obj.apps['name'] == undefined) {
            return "Please Enter Application Name"
        } else {
            return true
        }
    }

    // Update Company with User and App Details 
    function updateCompany(data) {
        var obj = {}
        var valField = true
        if (valField == true) {
            obj.company_name = data.company_name;
            obj.created_datetime = data.created_datetime
            obj.updated_datetime = new Date()
            var users = []
            for (var i = 0; i < data.users.length; i++) {
                var dataUsers = {
                    "first_name": data.users[i]['first_name'],
                    "last_name": data.users[i]['last_name'],
                    "id": data.company_name.substring(0, 2).toUpperCase() + data.users[i]['first_name'].substring(0, 3).toUpperCase() + ("00" + (i + 1)),
                    "email_id": data.users[i]['email_id'],
                    "password": passwordHash.generate(data.users[i]['password']),
                    "created_datetime": data.users[i]['created_datetime'] ? data.users[i]['created_datetime'] : new Date(),
                    "updated_datetime": new Date()
                }
                users.push(dataUsers)
            }
            obj.users = users;
            var apps = []
            for (var j = 0; j < data.apps.length; j++) {
                var dataApps = {
                    "name": data.apps[j]['name'],
                    "id": data.company_name.substring(0, 2).toUpperCase() + data.apps[j]['name'].substring(0, 3).toUpperCase() + ("00" + (j + 1)),
                    "app_logo": data.apps[j]['app_logo'] ? data.apps[j]['app_logo'] : null,
                    "created_datetime": data.users[j]['created_datetime'] ? data.users[j]['created_datetime'] : new Date(),
                    "updated_datetime": new Date()
                }
                apps.push(dataApps)
            }
            obj.apps = apps;

            var updateObj = { $set: obj };
            return companyCollection.findOneAndUpdate(
                {
                    "company_id": obj.company_id,
                    "_id": obj._id
                }, updateObj, {
                    returnOriginal: false
                }).then(result => {
                    if (result.value) {
                        var success = { "msg": "Successfully updated" };
                        return success
                    }
                    else {
                        var err = { "error": "Purchase Result not updated" };
                        return err;
                    }
                }).catch(err => {
                    console.log("err", err);
                });
        } else {
            return Promise.reject(valField);
        }
    }
    function deleteCompany(data) {
        return companyCollection.remove({ "company_id": data.company_id });
    }
    function getCount() {
        return companyCollection.count();
    }
}