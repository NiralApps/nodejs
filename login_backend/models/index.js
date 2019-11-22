module.exports = {
    install: function(app){
        app.models = {};
        app.models.company = require("./company")(app.db);
        app.models.log = require("./log")(app.db);
        app.models.login = require("./login")(app.db);
        app.models.dashboard = require("./dashboard")(app.db);  
        app.models.changePassword = require("./changePassword")(app.db);                                 
        return app;
    }
}