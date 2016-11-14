var loadConfig = function (fn) {
    try {
        return require(fn);
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
        }
        return {};
    }
};

var config = loadConfig('./config.js');
var localConfig = loadConfig('./local_config.js');

for (var k in localConfig) {
    if (localConfig.hasOwnProperty(k)) {
        config[k] = localConfig[k];
    }
}

module.exports = {
    get: function (key) {
        return config[key];
    }
};
