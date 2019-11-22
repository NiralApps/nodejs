module.exports = {
    install: function (app){
        require("./company")(app);
        require("./log")(app);  
        require("./login")(app);
        require("./dashboard")(app); 
        require("./sendEmail")(app);   
        require("./route")(app);    
        require("./changePassword")(app);               
        return app;
    }
}