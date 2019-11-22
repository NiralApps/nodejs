'use strict';
var mongo = require("mongodb"),
    ObjectId = mongo.ObjectId,
    jwt1 = require('jsonwebtoken'),
    apps = require("express"),
    utils = require("../utils"),
    _ = utils._;
const INVALID_ARGUMENTS = "Please enter valid arguments.";
const WARNING = "Warnings";
const ERROR = "Error";
const INFORMATION = "Information";

module.exports = function (db) {
    var logCollection = db.collection("log");
    var companyCollection = db.collection("company_info");
    // var logCollection = db.collection("log");
    // var moment = require('moment');
    var model = {};
    // model.getAllLogDetails = getAllLogDetails;
    model.getCompanyAppDetails = getCompanyAppDetails;
    model.getCompanyUserDetails = getCompanyUserDetails;
    model.getCompanyDetails = getCompanyDetails;
    // model.getUserInfo = getUserInfo;
    model.dashboardLog = dashboardLog;
    model.dashboardFilter = dashboardFilter;
    return model;
    //Insert, Update & Delete Company Details
    function dashboardApps(data) {
        return logCollection.find(dataField).sort({ "_id": -1 }).skip(toSkip).limit(countLimit).toArray()
            .then(logAppList => {
                return logCollection.find(dataField).count()
                    .then(logListCount => {
                        var result = []
                        if (logListCount) {
                            for (var i = 0; i < logListCount; i++) {
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
    }
    function dashboardLog(data) {
        console.log("data.query", data.query.company_id);
        return new Promise((resolve, reject) => {
            logCollection.find({ "company_id": data.query.company_id, "app_id": data.query.app_id }).toArray(function (err, result) {
                if (err) {
                    console.log(err);
                    reject({ "error": "Failure" })
                } else if (result.length > 0) {
                    console.log(result);
                    resolve({ "success": true, "data": result })
                }
            });
        })
    }
    function dashboardFilter(data) {
        console.log("data.query", data.query.search_key);
        return new Promise((resolve, reject) => {
            logCollection.find({ "company_id": data.query.company_id, "app_id": data.query.app_id, "log.type": data.query.log_type, "date_time": { '$gte': data.query.start_date, '$lt': data.query.end_date }, "log.message": { '$regex': data.query.search_key } }).toArray(function (err, result) {
                if (err) {
                    console.log(err);
                    reject({ "error": "Failure" })
                } else {
                    console.log(result);
                    resolve({ "success": true, "data": result })
                }
            });
        })
    }

    function getCompanyAppDetails(data) {
        var dataField = {}
        var firstWeek = {};
        var secondWeek = {};
        var thirdWeek = {};
        var AllCount = {};
        var errorCount = 0
        var infoCount = 0
        var warningCount = 0;
        var totalCount = 0;
        var compCount = 0
        if (data['company_id']) {
            dataField['company_id'] = data['company_id']
        }

        var countLimit = parseInt(data.limit) > 0 ? parseInt(data.limit) : 10000;
        var toSkip = parseInt(data.skip) > 0 ? parseInt(data.skip) : 0;
        getOneWeekData(data['company_id']).then(data => {
            console.log("getOneWeekData", data);
            firstWeek = data;
        });
        getSecondWeekData(data['company_id']).then(data => {
            console.log("getSecondWeekData", data)
            secondWeek = data;
        });
        getThirdWeekData(data['company_id']).then(data => {
            console.log("getThirdWeekData", data);
            thirdWeek = data;
        });
        getAllDetails(data['company_id']).then(data => {
            console.log("getAllCount", data);
            AllCount = data;
        });
        // return companyCollection.find(dataField).sort({ "_id": -1 }).skip(toSkip).limit(countLimit).toArray()
        return companyCollection.find(dataField).sort({ "_id": -1 }).toArray()
            .then(compAppList => {
                return companyCollection.find(dataField).count()
                    .then(compAppListCount => {
                        var result = []
                        var appCount = 0
                        if (compAppListCount) {
                            var compApp = compAppList[0]['apps']
                            appCount = parseInt(compApp.length)
                            var objField = {}
                            // return logCollection.find({}).sort({ "_id": -1 }).skip(toSkip).limit(countLimit).toArray()
                            return logCollection.find({}).sort({ "_id": -1 }).toArray()
                                .then(logAppList => {
                                    for (var i = 0; i < compApp.length; i++) {
                                        compApp[i]['errorCount'] = 0
                                        compApp[i]['warningCount'] = 0
                                        compApp[i]['infoCount'] = 0
                                        objField['app_id'] = compApp[i]['id']
                                        for (var j = 0; j < logAppList.length; j++) {
                                            if (objField['app_id'] == logAppList[j]['app_id'] && data['company_id'] == logAppList[j]['comp_id']) {
                                                if (logAppList[j]['type'] == "Error") {
                                                    compApp[i]['errorCount'] = compApp[i]['errorCount'] == 0 ? errorCount + 1 : (compApp[i]['errorCount'] + 1);
                                                } else if (logAppList[j]['type'] == "Warnings") {
                                                    compApp[i]['warningCount'] = compApp[i]['warningCount'] == 0 ? warningCount + 1 : (compApp[i]['warningCount'] + 1);
                                                } else if (logAppList[j]['type'] == "Information") {
                                                    compApp[i]['infoCount'] = compApp[i]['infoCount'] == 0 ? infoCount + 1 : (compApp[i]['infoCount'] + 1);
                                                }
                                            }
                                        }
                                        var getResult = {
                                            "_id": compApp[i]['_id'],
                                            "name": compApp[i]['name'],
                                            "id": compApp[i]['id'],
                                            "company_id": compApp[i]['comp_id'],
                                            "app_logo": compApp[i]['app_logo'],
                                            "seckey": compApp[i]['seckey'],
                                            "cliendId": compApp[i]['cliendId'],
                                            "errorCount": compApp[i]['errorCount'],
                                            "warningCount": compApp[i]['warningCount'],
                                            "infoCount": compApp[i]['infoCount'],
                                            "created_datetime": compApp[i]['created_datetime'],
                                        }
                                        result.push(getResult)
                                    }
                                    var finalRes = {
                                        "appList": result,
                                        "ErrorList": [firstWeek.error,secondWeek.error,thirdWeek.error],
                                        "InfoList": [firstWeek.info,secondWeek.info,thirdWeek.info],
                                        "WarningList": [firstWeek.warning,secondWeek.warning,thirdWeek.warning],
                                        "AllCount": [AllCount.errorCount, AllCount.warningCount, AllCount.infoCount],
                                        "count": appCount
                                    }
                                    return finalRes; // Final Result for Loglist for Particular App 
                                }).catch(err => {
                                    console.log("err", err)
                                });
                        } else {
                            var err = { "error": "log List not found" };
                            return err;
                        }
                    });

            }).catch(err => {
                return err;
            });
    }
    function getAllDetails(data){
        var dataFields = {
            "comp_id": data
        }
        return logCollection.find(dataFields).sort({ "_id": -1 }).toArray()
            .then(AllList => {
                var errorArr = [];
                var warningArr = [];
                var infoArr = [];
                console.log("All List",AllList);
                for(var i = 0; i < AllList.length; i++){
                    if (AllList[i]['type'] == "Error") {
                        var getResult = {
                            "_id": AllList[i]._id,
                            "app_id": AllList[i].app_id,
                            "comp_id": AllList[i].comp_id,
                            "issues": AllList[i].issues,
                            "type": AllList[i].type,
                            "platform": AllList[i].platform,
                            "device": AllList[i].device,
                            "version": AllList[i].version,
                            "created_dateTime": AllList[i].created_dateTime
                        }
                        errorArr.push(getResult)
                    } else if (AllList[i]['type'] == "Warnings") {
                        var getResult = {
                            "_id": AllList[i]._id,
                            "app_id": AllList[i].app_id,
                            "comp_id": AllList[i].comp_id,
                            "issues": AllList[i].issues,
                            "type": AllList[i].type,
                            "platform": AllList[i].platform,
                            "device": AllList[i].device,
                            "version": AllList[i].version,
                            "created_dateTime": AllList[i].created_dateTime
                        }
                        warningArr.push(getResult)
                    } else if (AllList[i]['type'] == "Information") {
                        var getResult = {
                            "_id": AllList[i]._id,
                            "app_id": AllList[i].app_id,
                            "comp_id": AllList[i].comp_id,
                            "issues": AllList[i].issues,
                            "type": AllList[i].type,
                            "platform": AllList[i].platform,
                            "device": AllList[i].device,
                            "version": AllList[i].version,
                            "created_dateTime": AllList[i].created_dateTime
                        }
                        infoArr.push(getResult)
                    }
                    // result.push(getResult)
                }
                // console.log(errorArr.length)
                // console.log(warningArr.length)
                // console.log(infoArr.length)
                var finalRes = {
                    "errorCount": errorArr.length,
                    "infoCount": infoArr.length,
                    "warningCount": warningArr.length
                }
                return finalRes;

            }).catch(err => {
                return err;
            });
    }
    function getOneWeekData(data) {
        var date = new Date();
        date.setDate(date.getDate())
        // console.log(date);
        var d = new Date(); // today!
        d.setDate(d.getDate() - 7);
        // console.log(d);
        var dataFields = {
            "comp_id": data,
            "created_dateTime": {
                $gte: d,
                $lt: date
            }
        }
        return logCollection.find(dataFields).sort({ "_id": -1 }).toArray()
            .then(FirstWeekList => {
                return logCollection.find(dataFields).count()
                    .then(FirstWeekListCount => {
                        var result = [];
                        var errorArr = [];
                        var warningArr = [];
                        var infoArr = [];
                        // console.log("logAppList", FirstWeekList);
                        // console.log("FirstWeekListCount", FirstWeekListCount);
                        // return FirstWeekListCount;
                        // if (logListCount) {
                        for (var i = 0; i < FirstWeekList.length; i++) {
                            if (FirstWeekList[i]['type'] == "Error") {
                                var getResult = {
                                    "_id": FirstWeekList[i]._id,
                                    "app_id": FirstWeekList[i].app_id,
                                    "comp_id": FirstWeekList[i].comp_id,
                                    "issues": FirstWeekList[i].issues,
                                    "type": FirstWeekList[i].type,
                                    "platform": FirstWeekList[i].platform,
                                    "device": FirstWeekList[i].device,
                                    "version": FirstWeekList[i].version,
                                    "created_dateTime": FirstWeekList[i].created_dateTime
                                }
                                errorArr.push(getResult)
                            } else if (FirstWeekList[i]['type'] == "Warnings") {
                                var getResult = {
                                    "_id": FirstWeekList[i]._id,
                                    "app_id": FirstWeekList[i].app_id,
                                    "comp_id": FirstWeekList[i].comp_id,
                                    "issues": FirstWeekList[i].issues,
                                    "type": FirstWeekList[i].type,
                                    "platform": FirstWeekList[i].platform,
                                    "device": FirstWeekList[i].device,
                                    "version": FirstWeekList[i].version,
                                    "created_dateTime": FirstWeekList[i].created_dateTime
                                }
                                warningArr.push(getResult)
                            } else if (FirstWeekList[i]['type'] == "Information") {
                                var getResult = {
                                    "_id": FirstWeekList[i]._id,
                                    "app_id": FirstWeekList[i].app_id,
                                    "comp_id": FirstWeekList[i].comp_id,
                                    "issues": FirstWeekList[i].issues,
                                    "type": FirstWeekList[i].type,
                                    "platform": FirstWeekList[i].platform,
                                    "device": FirstWeekList[i].device,
                                    "version": FirstWeekList[i].version,
                                    "created_dateTime": FirstWeekList[i].created_dateTime
                                }
                                infoArr.push(getResult)
                            }
                            // result.push(getResult)
                        }
                        // console.log(result.length)
                        // console.log(errorArr.length)
                        // console.log(warningArr.length)
                        // console.log(infoArr.length)
                        var finalRes = {
                            "error": errorArr.length,
                            "info": infoArr.length,
                            "warning": warningArr.length
                            // "count": logListCount
                        }
                        return finalRes; // Final Result for Loglist for Particular App 

                        // } else {
                        //     var err = { "error": "log List not found" };
                        //     return err;
                        // }
                    });

            }).catch(err => {
                return err;
            });
    }
    function getSecondWeekData(data) {
        var date = new Date();
        // date.setDate(date.getDate())
        date.setDate(date.getDate() - 8);
        // console.log(date);
        var d = new Date(); // today!
        d.setDate(d.getDate() - 14);
        // console.log(d);
        var dataFields = {
            "comp_id": data,
            "created_dateTime": {
                $gte: d,
                $lt: date
            }
        }
        // console.log("thirdWeek",dataFields)
        return logCollection.find(dataFields).sort({ "_id": -1 }).toArray()
            .then(SecondWeekList => {
                return logCollection.find(dataFields).count()
                    .then(SecondWeekListCount => {
                        var result = [];
                        var errorArr = [];
                        var warningArr = [];
                        var infoArr = [];
                        // console.log("logAppList", SecondWeekList);
                        // console.log("FirstWeekListCount", SecondWeekListCount);
                        // return FirstWeekListCount;
                        // if (logListCount) {
                        for (var i = 0; i < SecondWeekList.length; i++) {
                            if (SecondWeekList[i]['type'] == "Error") {
                                var getResult = {
                                    "_id": SecondWeekList[i]._id,
                                    "app_id": SecondWeekList[i].app_id,
                                    "comp_id": SecondWeekList[i].comp_id,
                                    "issues": SecondWeekList[i].issues,
                                    "type": SecondWeekList[i].type,
                                    "platform": SecondWeekList[i].platform,
                                    "device": SecondWeekList[i].device,
                                    "version": SecondWeekList[i].version,
                                    "created_dateTime": SecondWeekList[i].created_dateTime
                                }
                                errorArr.push(getResult)
                            } else if (SecondWeekList[i]['type'] == "Warnings") {
                                var getResult = {
                                    "_id": SecondWeekList[i]._id,
                                    "app_id": SecondWeekList[i].app_id,
                                    "comp_id": SecondWeekList[i].comp_id,
                                    "issues": SecondWeekList[i].issues,
                                    "type": SecondWeekList[i].type,
                                    "platform": SecondWeekList[i].platform,
                                    "device": SecondWeekList[i].device,
                                    "version": SecondWeekList[i].version,
                                    "created_dateTime": SecondWeekList[i].created_dateTime
                                }
                                warningArr.push(getResult)
                            } else if (SecondWeekList[i]['type'] == "Information") {
                                var getResult = {
                                    "_id": SecondWeekList[i]._id,
                                    "app_id": SecondWeekList[i].app_id,
                                    "comp_id": SecondWeekList[i].comp_id,
                                    "issues": SecondWeekList[i].issues,
                                    "type": SecondWeekList[i].type,
                                    "platform": SecondWeekList[i].platform,
                                    "device": SecondWeekList[i].device,
                                    "version": SecondWeekList[i].version,
                                    "created_dateTime": SecondWeekList[i].created_dateTime
                                }
                                infoArr.push(getResult)
                            }
                            // result.push(getResult)
                        }
                        // console.log(result.length)
                        // console.log(errorArr.length)
                        // console.log(warningArr.length)
                        // console.log(infoArr.length)
                        var finalRes = {
                            "error": errorArr.length,
                            "info": infoArr.length,
                            "warning": warningArr.length
                            // "count": logListCount
                        }
                        return finalRes; // Final Result for Loglist for Particular App 

                        // } else {
                        //     var err = { "error": "log List not found" };
                        //     return err;
                        // }
                    });

            }).catch(err => {
                return err;
            });
    }
    function getThirdWeekData(data) {
        var date = new Date();
        // date.setDate(date.getDate())
        date.setDate(date.getDate() - 15);
        // console.log(date);
        var d = new Date(); // today!
        d.setDate(d.getDate() - 21);
        // console.log(d);
        var dataFields = {
            "comp_id": data,
            "created_dateTime": {
                $gte: d,
                $lt: date
            }
        }
        // console.log("thirdWeek",dataFields)
        return logCollection.find(dataFields).sort({ "_id": -1 }).toArray()
            .then(ThirdWeekList => {
                return logCollection.find(dataFields).count()
                    .then(ThirdWeekListCount => {
                        var result = [];
                        var errorArr = [];
                        var warningArr = [];
                        var infoArr = [];
                        // console.log("logAppList", ThirdWeekList);
                        // console.log("FirstWeekListCount", ThirdWeekList);
                        // return FirstWeekListCount;
                        // if (logListCount) {
                        for (var i = 0; i < ThirdWeekList.length; i++) {
                            if (ThirdWeekList[i]['type'] == "Error") {
                                var getResult = {
                                    "_id": ThirdWeekList[i]._id,
                                    "app_id": ThirdWeekList[i].app_id,
                                    "comp_id": ThirdWeekList[i].comp_id,
                                    "issues": ThirdWeekList[i].issues,
                                    "type": ThirdWeekList[i].type,
                                    "platform": ThirdWeekList[i].platform,
                                    "device": ThirdWeekList[i].device,
                                    "version": ThirdWeekList[i].version,
                                    "created_dateTime": ThirdWeekList[i].created_dateTime
                                }
                                errorArr.push(getResult)
                            } else if (ThirdWeekList[i]['type'] == "Warnings") {
                                var getResult = {
                                    "_id": ThirdWeekList[i]._id,
                                    "app_id": ThirdWeekList[i].app_id,
                                    "comp_id": ThirdWeekList[i].comp_id,
                                    "issues": ThirdWeekList[i].issues,
                                    "type": ThirdWeekList[i].type,
                                    "platform": ThirdWeekList[i].platform,
                                    "device": ThirdWeekList[i].device,
                                    "version": ThirdWeekList[i].version,
                                    "created_dateTime": ThirdWeekList[i].created_dateTime
                                }
                                warningArr.push(getResult)
                            } else if (ThirdWeekList[i]['type'] == "Information") {
                                var getResult = {
                                    "_id": ThirdWeekList[i]._id,
                                    "app_id": ThirdWeekList[i].app_id,
                                    "comp_id": ThirdWeekList[i].comp_id,
                                    "issues": ThirdWeekList[i].issues,
                                    "type": ThirdWeekList[i].type,
                                    "platform": ThirdWeekList[i].platform,
                                    "device": ThirdWeekList[i].device,
                                    "version": ThirdWeekList[i].version,
                                    "created_dateTime": ThirdWeekList[i].created_dateTime
                                }
                                infoArr.push(getResult)
                            }
                            // result.push(getResult)
                        }
                        // console.log(result.length)
                        // console.log(errorArr.length)
                        // console.log(warningArr.length)
                        // console.log(infoArr.length)
                        var finalRes = {
                            "error": errorArr.length,
                            "info": infoArr.length,
                            "warning": warningArr.length
                            // "count": logListCount
                        }
                        return finalRes; // Final Result for Loglist for Particular App 

                        // } else {
                        //     var err = { "error": "log List not found" };
                        //     return err;
                        // }
                    });

            }).catch(err => {
                return err;
            });
    }
    function getCompanyUserDetails(data) {
        var dataField = {}
        if (data['company_id']) {
            dataField['company_id'] = data['company_id']
        }

        var countLimit = parseInt(data.limit) > 0 ? parseInt(data.limit) : 10000;
        var toSkip = parseInt(data.skip) > 0 ? parseInt(data.skip) : 0;

        return companyCollection.find(dataField).sort({ "_id": -1 }).skip(toSkip).limit(countLimit).toArray()
            .then(compAppList => {
                return companyCollection.find(dataField).count()
                    .then(compAppListCount => {
                        var result = []
                        var appCount = 0
                        if (compAppListCount) {
                            var compApp = compAppList[0]['users']
                            appCount = parseInt(compApp.length)
                            for (var i = 0; i < compApp.length; i++) {
                                var getResult = {
                                    "_id": compApp[i]['_id'],
                                    "first_name": compApp[i]['first_name'],
                                    "last_name": compApp[i]['last_name'],
                                    "id": compApp[i]['id'],
                                    "company_id": compApp[i]['comp_id'],
                                    "email_id": compApp[i]['email_id'],
                                    "password": compApp[i]['password'],
                                    "created_datetime": compApp[i]['created_datetime'],
                                }
                                result.push(getResult)
                            }
                            var finalRes = {
                                "usersList": result,
                                "count": appCount
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
    }

    function getCompanyDetails(data) {
        var dataField = {}
        var objField = {}
        if (data['compDomain']) {
            dataField['compDomain'] = data['compDomain']
        }

        var countLimit = parseInt(data.limit) > 0 ? parseInt(data.limit) : 10000;
        var toSkip = parseInt(data.skip) > 0 ? parseInt(data.skip) : 0;

        return companyCollection.find(dataField).sort({ "_id": -1 }).skip(toSkip).limit(countLimit).toArray()
            .then(compAppList => {
                return companyCollection.find(dataField).count()
                    .then(compAppListCount => {
                        var result = []
                        var appCount = 0
                        if (compAppListCount) {
                            var compApp = compAppList[0]
                            objField['_id'] = compApp['_id']
                            objField['company_id'] = compApp['company_id']
                            objField['compDomain'] = compApp['compDomain']
                            objField['company_name'] = compApp['company_name']
                            objField['created_datetime'] = compApp['created_datetime']
                            var finalRes = {
                                "compList": objField,
                                "count": compAppListCount
                            }
                            return finalRes; // Final Result for Loglist for Particular App 

                        } else {
                            var err = { "error": "Company List not found" };
                            return err;
                        }
                    });

            }).catch(err => {
                return err;
            });
    }

    // function getAllLogDetails(data) {
    //     var errCount = 0;
    //     var infoCount = 0;
    //     var warningCount = 0;
    //     var totalCount = 0;
    //     var obj = {}
    //     var result = []
    //     return logCollection.find({}).sort({ "_id": -1 }).skip(0).limit(10000).toArray()
    //         .then(logAppList => {
    //             return logCollection.find({}).count()
    //                 .then(logListCount => {
    //                     if (logListCount) {
    //                         for (var i = 0; i < logListCount; i++) {
    //                             console.log(logAppList[i].app_id)
    //                             var searchField = {}
    //                             searchField['app_id'] = logAppList[i].app_id
    //                             logCollection.find(searchField).sort({ "_id": -1 }).skip(0).limit(10000).toArray()
    //                                 .then(getAppListById => {
    //                                     for (var j = 0; j < getAppListById.length; j++) {
    //                                         if (getAppListById[j]['type'] == "Error") {
    //                                             errCount = errCount + 1
    //                                         } else if (getAppListById[j]['type'] == "Information") {
    //                                             infoCount = infoCount + 1
    //                                         } else if (getAppListById[j]['type'] == "Warning") {
    //                                             warningCount = warningCount + 1
    //                                         }
    //                                     }
    //                                     totalCount = errCount + infoCount + warningCount
    //                                     obj['app_id'] = logAppList[i].app_id
    //                                     obj['errCount'] = errCount;
    //                                     obj['infoCount'] = infoCount;
    //                                     obj['warningCount'] = warningCount
    //                                     obj['totalCount'] = totalCount
    //                                     result.push(obj)
    //                                 }).catch(err => {
    //                                     console.log("dsad",err)
    //                                 });
    //                         }
    //                         var finalRes = {
    //                             "dashboardList": result
    //                         }
    //                         return finalRes; // Final Result for Loglist for Particular App 

    //                     } else {
    //                         var err = { "error": "log List not found" };
    //                         return err;
    //                     }
    //                 });

    //         }).catch(err => {
    //             return err;
    //         });
    // }
}