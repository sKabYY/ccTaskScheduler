const {ipcRenderer} = require('electron');
var React = require('react');
var ReactDOM = require('react-dom');

var TasksTable = React.createClass({
    render: function () {
        return <table className="table table-condensed dashboard">
            <thead>
                <tr>
                    <th>TIME</th>
                    <th>TYPE</th>
                    <th>URL</th>
                </tr>
            </thead>
            <tbody>
            {
                ipcRenderer.sendSync('ts:getTasks').map(function (task) {
                    return <tr>
                        <td>{task.cronTime}</td>
                        <td>{task.type}</td>
                        <td>{task.url}</td>
                    </tr>;
                })
            }
            </tbody>
        </table>;
    }
});

const MAX_BUF_NUM = 255;
var Output = React.createClass({
    getInitialState: function () {
        ipcRenderer.on('output', function (event, line) {
            var buf = this.state.outputBuf;
            buf.push(line);
            let len = buf.length;
            if (len > MAX_BUF_NUM) {
                buf.splice(0, len - MAX_BUF_NUM);
            }
            this.setState({ outputBuf: buf });
        }.bind(this));
        return { outputBuf: [] };
    },
    render: function () {
        return <pre className="output">{this.state.outputBuf.slice(0).reverse().join('\n')}</pre>;
    }
});

ReactDOM.render(
    <div>
        <div className="col-sm-6">
            <TasksTable />
        </div>
        <div className="col-sm-6 output-panel">
            <Output />
        </div>
    </div>,
    document.getElementById('app')
);

ipcRenderer.sendSync('ts:start');
