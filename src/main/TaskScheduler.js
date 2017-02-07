const {CronJob} = require('cron');
const request = require('request');

const {infoLogger, errorLogger} = require('./logUtil.js');
const configUtil = require('./configUtil.js');

const getTasksInfo = () => {
    var tasks = configUtil.get('tasks');
    var defaultTaskType = configUtil.get('defaultTaskType');
    return tasks.map((t, idx) => {
        return Object.assign({type: defaultTaskType, id: idx}, t);
    });
};


const TaskScheduler = function (options) {
    const output = options.output || console.log;
    const info = (...args) => {
        infoLogger.info.apply(infoLogger, args);
        output.apply(null, args);
    };
    const error = (...args) => {
        errorLogger.info.apply(errorLogger, args);
        output.apply(null, args);
    };
    const self = this;

    const httpGet = url => {
        const httpPrefix = 'http://';
        if (url.toLowerCase().indexOf(httpPrefix) !== 0) {
            url = httpPrefix + url;
        }
        request({
            url: url,
            headers: configUtil.get('customHeaders') || {}
        }, function (err, res, body) {
            const msg = 'HttpGet: ' + url;
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

    const tasksInfo = getTasksInfo();
    const tasks = tasksInfo.map(taskInfo => {
        let taskProc = null;
        const taskType = taskInfo.type;
        if (taskType === 'Function') {
            taskProc = () => {
                const msg = taskInfo.func();
                info(msg);
            };
        } else if (taskType === 'HttpGet') {
            taskProc = function () {
                httpGet(taskInfo.url);
            };
        } else {
            error('unknown task type: ' + taskType);
        }
        let job = null;
        let onTick = null;
        if (taskProc) {
            onTick = () => {
                try {
                    taskProc();
                } catch (e) {
                    error(e);
                }
            };
            job = new CronJob(taskInfo.cronTime, onTick);
        }
        return {
            info: taskInfo,
            job: job,
            onTick: onTick
        };
    });

    Object.assign(self, {
        getTasks() {
            return tasksInfo;
        },
        startAll() {
            tasks.each(task => {
                task.job && task.job.start();
            });
        },
        execTaskById(id) {
            tasks.filter(task => {
                return task.info.id === id;
            }).each(task => {
                task.onTick && task.onTick();
            });
        },
        release() {
            tasks.each(task => {
                task.job && task.job.stop();
            });
        }
    });

    return self;
};


module.exports = TaskScheduler;