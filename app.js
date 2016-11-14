var cron = require('node-cron');
var configUtil = require('./configUtil.js');
var request = require('request');

var logUtil = require('./logUtil.js');
var info = logUtil.infoLogger;
var error = logUtil.errorLogger;

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
            error.error(msg);
            error.error(err);
        } else if (res.statusCode != 200) {
            error.error(msg);
            error.error(res);
            error.error(body);
        } else {
            info.info(msg);
            info.info(body);
        }
    });
};

var startTask = function (task) {
    var onTick = null;
    var taskType = task.type || configUtil.get('defaultTaskType');
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
                error.error(e);
            }
        });
    }
};

var startAll = function () {
    var tasks = configUtil.get('tasks');
    for (var i = 0; i < tasks.length; ++i) {
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
                    console.log(args.join(' '));
                    break;
                case '':
                    break;
                default:
                    console.log('unknown command: ' + cmd);
                    break;
            }
        }
        rl.prompt();
    });
    rl.prompt();
};

startAll();
repl();
