var React = require('react');
var ReactDOM = require('react-dom');

global.outputLine = function (line) {
    // dummy
    // TODO: cache log and flush after DOM mounted
};
const ts = require('./taskScheduler.js');

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
                ts.getTasks().map(function (task) {
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
        return { outputBuf: [] };
    },
    componentDidMount: function () {
        global.outputLine = function (line) {
            var buf = this.state.outputBuf;
            buf.push(line);
            let len = buf.length;
            if (len > MAX_BUF_NUM) {
                buf.splice(0, len - MAX_BUF_NUM);
            }
            this.setState({ outputBuf: buf });
        }.bind(this);
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

ts.start();
