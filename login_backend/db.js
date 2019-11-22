var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;
module.exports = {
    connect: function (app) {
        return new Promise((resolve, reject) => {
            MongoClient.connect('mongodb://Vthink:Vthink%40123@ds251518.mlab.com:51518/logger_db', function (err, db) {
                if (!err) {
                    app.db = db;
                    resolve(app);   
                    console.log("Successfully connected to db");
                } else {
                    reject(err);
                    console.log("Failed to connect to db");
                }
            });
        });
    }
}