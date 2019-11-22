module.exports = {
    install: function (app) {
        app.middlewares = require('./rest')(app);
        return app;
    }
}