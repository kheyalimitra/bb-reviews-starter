'use strict';
module.exports = function (app) {
    app.get('/hello', function (req, res) {
        req.logger.info("Responding Hello World")
        return res.send('Hello World!')
    });
};