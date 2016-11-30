const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');

const path = require('path');
let toPath = function (fn) {
    return path.join(__dirname, fn);
};

const url = require('url');

let mainWindow;
let createWindow = function () {
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

global.outputLine = function (line) {
    if (typeof line !== 'string') {
        line = JSON.stringify(line);
    }
    mainWindow.webContents.send('output', line);
};

const ts = require('./assets/core/taskScheduler.js');
['getTasks', 'start'].forEach(function (method) {
    ipcMain.on('ts:' + method, function (event, arg) {
        var ret = ts[method]();
        if (ret === undefined) ret = null;
        event.returnValue = ret;
    });
});
