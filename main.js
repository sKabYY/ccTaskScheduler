const {
    app,
    BrowserWindow
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