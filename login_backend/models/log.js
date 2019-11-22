// import { ObjectID } from "../../../../../../Library/Caches/typescript/2.6/node_modules/@types/bson";

'use strict';
var mongo = require("mongodb"),
    ObjectId = mongo.ObjectId,
    utils = require("../utils"),
    _ = utils._;
const INVALID_ARGUMENTS = "Please enter valid arguments.";
module.exports = function (db) {
    var logCollection = db.collection("log");
    var moment = require('moment');
    var companyCollection = db.collection("company_info")
    var model = {};
    var obj = {};
    model.insertlog = insertlog;
    model.getlogDetails = getlogDetails;
    // model.getAllLogList = getAllLogList;
    return model;

    // Insert Log 
    function insertlog(data) {
        var obj = {}
        var dataField = {}
        if (data.company_id) {
            dataField['company_id'] = data.company_id
        }
        var countLimit = 10000;
        var toSkip = 0;
        var valField = validateField(data)
        if (valField == true) {
            return companyCollection.find(dataField).sort({ "_id": -1 }).skip(toSkip).limit(countLimit).toArray()
                .then(compAppList => {
                    var compList = compAppList[0]
                    for (var i = 0; i < compList['apps'].length; i++) {
                        var compApp = compList['apps']
                        if (data['app_id'] == compApp[i]['id']) {
                            var app_id = compApp[i]['id']
                            var secKey = compApp[i]['seckey']
                            if (secKey != data['secKeyId']) {
                                return "Please Give Correct Secret Id"
                            }
                        }
                    }
                    obj = {
                        "_id": ObjectId(),
                        "app_id": app_id,
                        "comp_id": compList.company_id,
                        "issues": data.issues,
                        "type": data.type,
                        "platform": data.platform,
                        "device": data.device,
                        "version": data.version,
                        "created_dateTime": new Date(),
                    };
                    return logCollection.insert(obj);
                }).catch(err => {
                    return err;
                });

        } else {
            return Promise.reject(valField);
        }
    }

    // Get All Log List in Details by App Id
    function getlogDetails(data) {
        var obj = {}
        var dataField = {}

        if(data.startDate || data.endDate || data.type){
            // var startDate = moment(data.startDate).toISOString();
            // var endDate = moment(data.endDate).toISOString(); 
            // var startDate = new Date(data.startDate); 
            // var endDate = new Date(data.endDate); 
            // startDate = startDate.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
            // endDate = endDate.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
            // return;
            dataField = {
                "comp_id" : data.comp_id ? data.comp_id : "",
                "app_id" : data.app_id ? data.app_id : "",
                "type" : data.type ? data.type : "",
                "created_dateTime": {
                    $gte: data.startDate ? new Date(data.startDate) : "",
                    $lt: data.endDate ? new Date(data.endDate) : ""
                }
            }
        } else {
            dataField = {
                "comp_id" : data.comp_id ? data.comp_id : "",
                "app_id" : data.app_id ? data.app_id : ""
            }
        }
        // if (data.startDate) {
        //     dataField['created_dateTime'] = data.startDate
        // }
        // if (data.endDate) {
        //     dataField['created_dateTime'] = data.endDate
        // }
        console.log(dataField);
        var countLimit = parseInt(data.limit) > 0 ? parseInt(data.limit) : 10000;
        var toSkip = parseInt(data.skip) > 0 ? parseInt(data.skip) : 0;

        var valField = validateFieldForLog(data)
        if (valField == true) {
            // return logCollection.find(dataField).sort({ "_id": -1 }).skip(toSkip).limit(countLimit).toArray()
            return logCollection.find(dataField).sort({ "_id": -1 }).toArray()
                .then(logAppList => {
                    return logCollection.find(dataField).count()
                        .then(logListCount => {
                            var result = []
                            if (logListCount) {
                                for (var i = 0; i < logAppList.length; i++) {
                                    var getResult = {
                                        "_id": logAppList[i]._id,
                                        "app_id": logAppList[i].app_id,
                                        "comp_id": logAppList[i].comp_id,
                                        "issues": logAppList[i].issues,
                                        "type": logAppList[i].type,
                                        "platform": logAppList[i].platform,
                                        "device": logAppList[i].device,
                                        "version": logAppList[i].version,
                                        "created_dateTime": logAppList[i].created_dateTime
                                    }
                                    result.push(getResult)
                                }
                                var finalRes = {
                                    "logList": result,
                                    "count": logListCount
                                }
                                return finalRes; // Final Result for Loglist for Particular App 

                            } else {
                                var err = { "error": "log List not found" };
                                return err;
                            }
                        });
                }).catch(err => {
                    return err;
                });

        } else {
            return Promise.reject(valField);
        }

    }

    // Validate Field for Log
    function validateFieldForLog(obj) {
        if (obj.app_id == "" || obj.app_id == undefined) {
            return "Please Add Application Id"
        } else if (obj.comp_id == "" || obj.comp_id == undefined) {
            return "Please Add Company Id"
        } else {
            return true
        }
    }

    // Check Validate Field 
    function validateField(obj) {
        if (obj.app_id == "" || obj.app_id == undefined) {
            return "Please Give Application Id"
        } else if (obj.issues == "" || obj.issues == undefined) {
            return "Please Give Issues"
        } else if (obj.type == "" || obj.type == undefined) {
            return "Please Give Type"
        } else if (obj.platform == "" || obj.platform == undefined) {
            return "Please Give Platform"
        } else if (obj.device == "" || obj.device == undefined) {
            return "Please Give Device"
        } else if (obj.version == "" || obj.version == undefined) {
            return "Please Give Version"
        } else {
            return true
        }
    }
}