const log4js = require('log4js');
log4js.configure('./log4js.config.json');
const info = log4js.getLogger('logInfo');
const error = log4js.getLogger('logError');

module.exports = {
    infoLogger: info,
    errorLogger: error
};
