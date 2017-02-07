require('./assets/lib/cc/cc.core.js');
const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');

const path = require('path');
const toPath = function (fn) {
    return path.join(__dirname, fn);
};

const url = require('url');

let mainWindow;
const createWindow = function () {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 480
    });
    mainWindow.loadURL(url.format({
        pathname: toPath('index.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
};


app.on('ready', createWindow);
app.on('window-all-closed', function () {
    app.quit();
});
app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

const TaskScheduler = require('./assets/main/TaskScheduler');
const ts = new TaskScheduler({
    output(line) {
        if (typeof line !== 'string') {
            line = JSON.stringify(line);
        }
        mainWindow.webContents.send('output', line);
    }
});
['getTasks', 'startAll', 'execTaskById'].forEach(function (method) {
    ipcMain.on('ts:' + method, (event, args) => {
        var ret = ts[method].apply(ts, args);
        if (ret === undefined) ret = null;
        event.returnValue = ret;
    });
});

app.on('will-quit', () => {
    ts.release();
});
