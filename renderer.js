let app;

global.outputLine = function (line) {
    app.output(line);
};
const ts = require('./taskScheduler.js');

ts.start();

const MAX_BUF_NUM = 255;

app = global.app = new Vue({
    el: '#app',
    data: {
        tasks: ts.getTasks(),
        outputBuf: []
    },
    methods: {
        output: function (line) {
            this.outputBuf.push(line);
            let len = this.outputBuf.length;
            if (len > MAX_BUF_NUM) {
                this.outputBuf.splice(0, len - MAX_BUF_NUM);
            }
        }
    }
});
