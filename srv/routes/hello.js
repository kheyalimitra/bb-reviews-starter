'use strict';

module.exports = function (app) {
    app.get('/hello', async function (req, res) {
        var flag = await app.featureFlag('test')
        if(flag)
        {
            req.logger.info("Feature is on, responding Hello World")
            return res.send('Hello World!')
        }
        else
        {
            return res.status(400).end()
        }
    });
};