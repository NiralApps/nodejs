var express = require('express'),      
bodyParser = require('body-parser'),
http = require('http');
module.exports = {
    install: function (app){
       // var cors= require('cors');
        var exp = express();
        exp.use(bodyParser.json());
        exp.use(bodyParser.urlencoded({ extended: false }));
        exp.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
            res.header("Access-Control-Allow-Credentials",true);
            res.header("Access-Control-Allow-Headers","accessToken, X-Requested-With,Content-Type,Accept");
            next();
        });
       // exp.use(cors());
        app.server = exp;
        return app;
    },
    start: function (app){
        var port = process.env.PORT || '3000';
        app.server.set('port', port);
        return new Promise((resolve, reject) => {
            app.server = http.createServer(app.server);
            app.server.timeout = 0;
            app.server.listen(port);
            app.server.on('error', function(error){
                reject(error);
            });
            app.server.on('listening', function(){
                console.log("Listening on " + JSON.stringify(app.server.address()));
                resolve(app);
            });
        });
    }
}