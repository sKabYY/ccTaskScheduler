var logUtil = require('./logUtil.js');

module.exports = {
    version: '0.1.0',
    defaultTaskType: 'HttpGet',
    customHeaders: {},
    tasks: [{
        cronTime: '* * * * * *',
        url: 'example.org'
    }, {
        cronTime: '* * * * * *',
        url: 'localhost/error-address'
    }, {
        cronTime: '* * * * * *',
        type: 'Function',
        func: function () {
            logUtil.infoLogger.info(new Date());
        }
    }]
};