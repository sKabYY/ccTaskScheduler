var cron = require('node-cron');
var request = require('request');

if (typeof outputLine === 'undefined') {
    outputLine = console.log;
}

var configUtil = require('./configUtil.js');

var logUtil = require('./logUtil.js');
var infoLogger = logUtil.infoLogger;
var errorLogger = logUtil.errorLogger;
var info = function () {
    infoLogger.info.apply(infoLogger, arguments);
    outputLine.apply(null, arguments);
};
var error = function () {
    errorLogger.info.apply(errorLogger, arguments);
    outputLine.apply(null, arguments);
};

var httpGet = function (url) {
    var httpPrefix = 'http://';
    if (url.toLowerCase().indexOf(httpPrefix) !== 0) {
        url = httpPrefix + url;
    }
    request({
        url: url,
        headers: configUtil.get('customHeaders') || {}
    }, function (err, res, body) {
        var msg = 'HttpGet: ' + url;
        if (err) {
            error(msg);
            error(err);
        } else if (res.statusCode != 200) {
            error(msg);
            error(res);
            error(body);
        } else {
            info(msg);
            info(body);
        }
    });
};

var startTask = function (task) {
    var onTick = null;
    var taskType = task.type;
    if (taskType === 'Function') {
        onTick = task.func;
    } else if (taskType === 'HttpGet') {
        onTick = function () {
            httpGet(task.url);
        };
    } else {
        console.error('unknown task type: ' + taskType);
    }
    if (onTick) {
        cron.schedule(task.cronTime, function () {
            try {
                onTick();
            } catch (e) {
                error(e);
            }
        });
    }
};

var startAll = function () {
    var tasks = configUtil.get('tasks');
    for (var i = 0; i < tasks.length; ++i) {
        tasks[i].type = tasks[i].type || configUtil.get('defaultTaskType');
        startTask(tasks[i]);
    }
};

var readline = require('readline');
var repl = function () {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });
    rl.on('line', function (line) {
        var words = line.trim().split(/\s+/);
        if (words.length > 0) {
            var cmd = words[0];
            var args = words.slice(1);
            switch (cmd) {
                case 'echo':
                    outputLine(args.join(' '));
                    break;
                case '':
                    break;
                default:
                    outputLine('unknown command: ' + cmd);
                    break;
            }
        }
        rl.prompt();
    });
    rl.prompt();
};

module.exports = {
    start: function () {
        startAll();
    },
    getTasks: function () {
        return configUtil.get('tasks');
    }
};
