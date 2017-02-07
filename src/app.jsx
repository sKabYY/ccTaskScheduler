const {ipcRenderer} = require('electron');
const React = require('react');
const {render} = require('react-dom');
const EventEmitter = require('events');

const TaskList = require('./views/TaskList');
const OutputPanel = require('./views/OutputPanel');

const app = global.app = new EventEmitter();
const ts = {};
['getTasks', 'startAll', 'execTaskById'].forEach(method => {
    ts[method] = (...args) => ipcRenderer.sendSync('ts:' + method, args);
});

(() => {
    Object.assign(app, {
        store: { tasks: ts.getTasks() },
        getTasks() {
            return app.store.tasks;
        },
        execTaskById(id) {
            ts.execTaskById(id);
        },
        startAll() {
            ts.startAll();
        }
    });

    ipcRenderer.on('output', (event, line) => {
        app.emit('output', line);
    });
})();

const AppView = React.createClass({
    getInitialState() {
        this.app = this.props.app;
        return {};
    },
    render() {
        return (
            <div>
                <ul id="nav" className="nav nav-tabs" role="tablist">
                    <li className="active"><a data-toggle="tab" href="#task-list" role="tab">Tasks</a></li>
                    <li><a href="#output-panel" data-toggle="tab" role="tab">Output</a></li>
                </ul>
                <div className="tab-content">
                    <div id="task-list" role="tabpanel" className="tab-pane active">
                        <TaskList app={this.app} />
                    </div>
                    <div id="output-panel" role="tabpanel" className="tab-pane">
                        <OutputPanel app={this.app} />
                    </div>
                </div>
            </div>
        );
    }
});

render(<AppView app={app} />, document.getElementById('app'));

app.startAll();
