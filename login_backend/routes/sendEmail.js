var express = require('express'),
    router = express.Router(),
    utils = require("../utils"),
    _ = utils._;
    // var customiseHTML = require("../www/index.html");
    var generator = require('generate-password');
var bcrypt = require('bcrypt');
var premailer = require('premailer-api')
var fs = require('fs')
const saltRounds = 10;
const nodemailer = require('nodemailer');
const INVALID_ARGUMENTS = "Please enter valid arguments.";
const USERID = "vthinktester@gmail.com";
const PASSWORD = "Vthink@123";
const pug = require('pug');
var path = require('path');
var tempPath1 = path.resolve(__dirname, "../", 'customiseMsg.pug'); // Customise Message.pub file has a html file for Forget Password Template
const compiledFunction = pug.compileFile(tempPath1);
var jwt1 = require('jsonwebtoken');
var apps = express();
var hashPass;
var EmailTemplate = require('email-templates');
module.exports = function (app) {
    var TokenCollection = app.db.collection("company_info");
    var models = app.models;
    router.post('/sendEmail', sendForgetEmail);
    var config = require('../config');
    apps.set('superSecret', config.secret);
    app.server.use('/', app.middlewares.rest());
    app.server.use('/', router);

    // Send Forget Mail 
    function sendForgetEmail(req, res) {
        var data = req.body
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: USERID,
                pass: PASSWORD,
            },
        });
        var password = generator.generate({
            length: 10,
            numbers: false
        });
        var hashPass = bcrypt.hashSync(password, saltRounds)
        var tempPath = path.resolve(__dirname, "../", 'customiseMsg.pug'); // Customise Message.pub file has a html file for Forget Password Template
        const mailOptions = {
            from: USERID,
            to: data['email_id'],
            subject: 'Password Reset',
            html: { path: tempPath }
        };

        mailOptions.html = compiledFunction({
            userName: data['user_name'],
            password: password
          });

          jwt1.verify(req.headers.accesstoken, apps.get('superSecret'), function(err, decoded) {
            if(err){
                console.log(err)
            } else {
                var objField = {}
                objField['compDomain'] = data['compDomain']
                
                TokenCollection.findOne(objField, function (err, docs) {
                    if(docs){
                        var userLength = docs['users']
                        for(var i = 0; i < userLength.length ; i++){
                            if(decoded['email_id'] == userLength[i]['email_id']){
                                userLength[i]['password'] = hashPass
                                var updateObj = { $set: userLength[i]['password'] };
                                return TokenCollection.findOneAndUpdate(
                                    {
                                        "compDomain": data['compDomain']
                                    }, docs, {
                                        returnOriginal: false
                                    }).then(result => {
                                        transport.sendMail(mailOptions, (error, info) => {
                                            if(info){
                                                // return (info)
                                                // return "Success"
                                                res.status(200).send({ "success": true, "message": "Message Sent Successfully" })
                                            } else{
                                                // return "Error"
                                                res.status(409).send({ "success": false, "message": "Message not Sent" });
                                            }
                                        });
                                    }).catch(err => {
                                        return reject(err);
                                    });
                            }
                        }
                    }
                
            });
        }
          });   
    }
}