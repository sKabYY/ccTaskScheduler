const React = require('react');
const prettyCron = require('../lib/prettycron-hack/prettycron');

const TaskList = React.createClass({
    getInitialState: function () {
        this.app = this.props.app;
        this.app.on('update:tasks', (event, tasks) => {
            this.setState({ tasks: tasks });
        });
        return { tasks: this.app.getTasks() };
    },
    render() {
        const guruUrl = "https://crontab.guru";
        const helpTooltip = guruUrl + "，需要互联网连接";
        return (
            <div>
                <table className="table table-condensed dashboard">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>CRON TIME
                                (<a href={guruUrl} target="_blank" data-toggle="tooltip" title={helpTooltip}>HELP</a>)</th>
                            <th>TYPE</th>
                            <th>URL</th>
                            <th>REMARK</th>
                            <th>#</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.tasks.map((task, idx) => {
                            const id = task.id;
                            return (
                                <tr key={id}>
                                    <td>{idx+1}</td>
                                    <td><span data-toggle="tooltip" title={prettyCron.toString(task.cronTime, true)}>{task.cronTime}</span></td>
                                    <td>{task.type}</td>
                                    <td>{task.url}</td>
                                    <td>{task.remark}</td>
                                    <td>
                                        <a href="#" onClick={() => this.app.execTaskById(id)}>立刻执行</a>
                                    </td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </div>
        );
    }
});

module.exports = TaskList;