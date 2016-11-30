var loadConfig = function (fn) {
    try {
        return require(fn);
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
        }
        return null;
    }
};

var config;
var initConfig = function () {
    config = loadConfig('./config.js');
    var localConfig = loadConfig('./local_config.js');

    if (config === null && localConfig === null) {
        throw 'no config loaded! dir=' + __dirname;
    }

    config = config || {};
    localConfig = localConfig || {};

    for (var k in localConfig) {
        if (localConfig.hasOwnProperty(k)) {
            config[k] = localConfig[k];
        }
    }
};

initConfig();

module.exports = {
    get: function (key) {
        return config[key];
    }
};
