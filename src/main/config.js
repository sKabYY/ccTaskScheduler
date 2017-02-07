var logUtil = require('./logUtil.js');

module.exports = {
    version: '0.1.0',
    defaultTaskType: 'HttpGet',
    customHeaders: {},
    tasks: [{
        cronTime: '0 0 * * * *',
        url: 'example.org'
    }, {
        cronTime: '0 * * * * *',
        url: 'localhost/error-address'
    }, {
        cronTime: '* * * * * *',
        type: 'Function',
        func: function () {
            var now = new Date();
            logUtil.infoLogger.info(now);
            return now;
        }
    }]
};
