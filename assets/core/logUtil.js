var log4js = require('log4js');
log4js.configure('./log4js.config.json');
var info = log4js.getLogger('logInfo');
var error = log4js.getLogger('logError');

module.exports = {
    infoLogger: info,
    errorLogger: error
};
